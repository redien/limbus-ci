
// limbus-ci - A simple CI solution for testing extremely portable applications.
// Written in 2016 by Jesper Oskarsson jesosk@gmail.com
//
// To the extent possible under law, the author(s) have dedicated all copyright
// and related and neighboring rights to this software to the public domain worldwide.
// This software is distributed without any warranty.
//
// You should have received a copy of the CC0 Public Domain Dedication along with this software.
// If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.

var Promise = require('promise');
var commander = require('commander');
var shell = require('../utilities/shell.js');
var fs = require('../utilities/filesystem.js');

var vagrantInit = function (image, script) {
    return fs.deleteFile('Vagrantfile')
    .then(function (exists) {
        return fs.copyFile(script, 'provisioning_script.sh');
    })
    .then(function () {
        return fs.writeFile('Vagrantfile', `
Vagrant.configure(2) do |config|
  config.vm.box = "${image}"
  config.vm.box_check_update = false
  config.vm.provision "shell", path: "provisioning_script.sh"
end
`)
    });
};

var vagrantUp = function () {
    return shell.execute('vagrant up');
};

var vagrantDestroy = function () {
    return shell.execute('vagrant destroy -f');
};

var pending = '{"status": "pending"}';

var job = function (image, script) {
    if (!image || !script) {
        return Promise.resolve(pending);
    }

    return vagrantInit(image, script)
        .then(vagrantUp)
        .then(function (stdout) {
            return vagrantDestroy().then(function () {
                return Promise.resolve('{"status": "success", "stdout": ' + JSON.stringify(stdout) + '}');
            });
        }, function (error) {
            if (error.stderr && error.stderr.indexOf('The SSH command responded with a non-zero exit status') !== -1) {
                return vagrantDestroy().then(function () {
                    return Promise.resolve('{"status": "failure", "stdout": ' + JSON.stringify(error.stdout) + '}');
                });
            } else if (error.stderr && error.stderr.indexOf('Couldn\'t open file') !== -1) {
                return Promise.resolve(pending);
            } else if (error.message.match(/no such file or directory/g)) {
                return Promise.resolve(pending);
            } else {
                return Promise.reject(error);
            }
        });
};

var executeCommand = function (command) {
    return function () {
        command.apply(null, arguments).then(function (stdout) {
            console.log(stdout);
        }, function (error) {
            console.error(error);
            process.exit(-1);
        });
    };
};

commander
    .version('0.1.0');

commander
    .command('job <image> <script>')
    .action(executeCommand(job));

commander.parse(process.argv);
