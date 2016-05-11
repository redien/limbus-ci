
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
var shell = require('../utilities/shell');
var fs = require('../utilities/filesystem');
var sh = require('../installation-scripts/sh');

var limbusCiDirectoryPath = '.limbusci';

var makeInstallScriptString = function () {
    var string = '';
    for (var command in sh.installScripts) {
        if (sh.installScripts.hasOwnProperty(command)) {
            string += '   config.vm.provision "file", source: "install_' + command + '.sh", destination: "install_' + command + '.sh"\n';
            // Set execution bit on scripts
            string += '   config.vm.provision "shell", inline: "sudo chmod 744 ~/install_' + command + '.sh", privileged: false\n';
        }
    }

    return string;
};

var writeInstallScripts = function () {
    var promise = Promise.resolve();
    for (var command in sh.installScripts) {
        if (sh.installScripts.hasOwnProperty(command)) {
            (function (command) {
                promise = promise.then(function () {
                    return fs.writeFile(limbusCiDirectoryPath + '/install_' + command + '.sh', sh.installScripts[command]);
                });
            })(command);
        }
    }
    return promise;
};

var initLimbusCiDirectory = function () {
    return fs.createDirectory(limbusCiDirectoryPath);
};

var vagrantAssertNotRunning = function () {
    return function () {
        return shell.execute('vagrant status', {cwd: limbusCiDirectoryPath}).then(function (stdout) {
            if (stdout.match(/default\s+running/g)) {
                return Promise.reject(new Error('a job is already running'));
            } else {
                return Promise.resolve();
            }
        }, function () {
            return Promise.resolve();
        });
    };
};

var vagrantInit = function (image, script) {
    return function () {
        return fs.deleteFile(limbusCiDirectoryPath + '/Vagrantfile')
        .then(function (exists) {
            return fs.copyFile(script, limbusCiDirectoryPath + '/provisioning_script.sh');
        })
        .then(function () {
            return writeInstallScripts();
        })
        .then(function () {
            return fs.writeFile(limbusCiDirectoryPath + '/Vagrantfile',
    'Vagrant.configure(2) do |config|\n' +
    '   config.vm.box = "' + image + '"\n' +
    '   config.vm.box_check_update = false\n' +
    makeInstallScriptString() +
    '   config.vm.provision "shell", path: "provisioning_script.sh", privileged: false\n' +
    'end\n');
        });
    };
};

var vagrantUp = function () {
    return function () {
        return shell.execute('vagrant up', {cwd: limbusCiDirectoryPath});
    };
};

var vagrantDestroy = function () {
    return shell.execute('vagrant destroy -f', {cwd: limbusCiDirectoryPath});
};

var pending = function (format) {
    return {
        status: 'pending',
        format: format
    };
};

var job = function (image, script, command) {
    if (!image || !script) {
        return Promise.resolve(pending(command.format));
    }

    return initLimbusCiDirectory()
        .then(vagrantAssertNotRunning())
        .then(vagrantInit(image, script))
        .then(vagrantUp())
        .then(function (stdout) {
            return vagrantDestroy().then(function () {
                return Promise.resolve({
                    status: 'success',
                    log: stdout,
                    format: command.format
                });
            });
        }, function (error) {
            if (error.stderr && error.stderr.indexOf('The SSH command responded with a non-zero exit status') !== -1) {
                return vagrantDestroy().then(function () {
                    return Promise.resolve({
                        status: 'failure',
                        log: error.stdout,
                        format: command.format
                    });
                });
            } else if (error.stderr && error.stderr.indexOf('Couldn\'t open file') !== -1) {
                return Promise.resolve(pending(command.format));
            } else if (error.message.match(/no such file or directory/g)) {
                return Promise.resolve(pending(command.format));
            } else {
                return Promise.reject({
                    status: 'error',
                    log: (error.stdout ? error.stdout : error.message),
                    format: command.format
                });
            }
        });
};

var formatResult = function (result) {
    if (result.format === 'human') {
        return (result.log || '') + '\n\n' +
            'Status: ' + result.status + '\n';
    } else {
        return JSON.stringify({
            status: result.status,
            log: result.log
        });
    }
};

var executeCommand = function (command) {
    return function () {
        command.apply(null, arguments).then(function (result) {
            console.log(formatResult(result));

        }, function (error) {
            if (error.status === 'error') {
                console.log(formatResult(error));
            } else {
                console.error(error);
            }

            process.exit(-1);
        });
    };
};

commander
    .version('0.1.0');

commander
    .command('job <image> <script>')
    .option('-f, --format <format>', 'Format of output')
    .action(executeCommand(job));

commander.parse(process.argv);
