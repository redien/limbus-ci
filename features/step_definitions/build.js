
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
var shell = require('../../utilities/shell.js');
var fs = require('../../utilities/filesystem.js');

var defaultImage = 'moszeed/boot2docker';

var two_minutes = 2 * 60 * 1000;

var parseResult = function (stdout) {
    try {
        return Promise.resolve(JSON.parse(stdout));
    } catch (error) {
        return Promise.reject(new Error('Got error "' + error.message + '" trying to parse:\n' + stdout));
    }
};

var executeJob = function (image, script, flags) {
    var jobCommand = [
        '../bin/limbus-ci job',
        flags || '',
        image,
        script
    ].join(' ');

    return shell.execute(jobCommand, {cwd: 'temp'});
};

var writeSucceedingScript = function (world) {
    world.script = 'succeeding_script.sh';
    return fs.writeFile('temp/' + world.script, '#!/bin/sh\necho Success');
};

var writeFailingScript = function (world) {
    world.script = 'failing_script.sh';
    return fs.writeFile('temp/' + world.script, '#!/bin/sh\ncommand-that-does-not-exist-should-fail');
};

var writeScriptWithContents = function (world, contents) {
    world.script = 'script.sh';
    return fs.writeFile('temp/' + world.script, contents);
};

var leaveRunning = function () {
    return fs.writeFile('temp/Vagrantfile',
        'Vagrant.configure(2) do |config|\n' +
            'config.vm.box = "' + defaultImage + '"\n' +
            'config.vm.box_check_update = false\n' +
        'end\n').then(function () {
        return shell.execute('vagrant up', {cwd: 'temp'});
    });
};

module.exports = function () {
    this.Given(/^I do not supply an image$/, function () {
        this.image = '';
        return Promise.resolve();
    });

    this.Given(/^I supply an image$/, function () {
        this.image = defaultImage;
        return Promise.resolve();
    });

    this.Given(/^I do not supply a script$/, function () {
        this.script = '';
        return Promise.resolve();
    });

    this.Given(/^I supply a missing script$/, function () {
        this.script = 'missing-script';
        return Promise.resolve();
    });

    this.Given(/^I supply a succeeding script$/, function () {
        return writeSucceedingScript(this);
    });

    this.Given(/^I supply a failing script$/, function () {
        return writeFailingScript(this);
    });

    this.Given(/^I supply a script with the contents:$/, function (contents) {
        return writeScriptWithContents(this, contents);
    });

    this.Given(/^I supply a script that writes a file$/, function () {
        this.script = 'script.sh';
        return fs.writeFile('temp/' + this.script, '#!/bin/sh\necho IXsF9wOlwqg > k3xQkqHwe.txt');
    });

    this.Given(/^I supply a script that makes sure that the file does not exist$/, function () {
        this.script = 'script.sh';
        return fs.writeFile('temp/' + this.script, '#!/bin/sh\ntest ! -e k3xQkqHwe.txt');
    });

    this.Given(/^I supply a script that checks that the current user is not root$/, function () {
        this.script = 'script.sh';
        return fs.writeFile('temp/' + this.script, '#!/bin/sh\ntest "$USER" != "root"');
    });

    this.Given(/^I supply a missing image$/, function () {
        this.image = 'missing-image';
        return Promise.resolve();
    });

    this.Given(/^a previous job is left running$/, {timeout: two_minutes}, function () {
        return leaveRunning();
    });

    this.Given(/^I use the option '([^\']+)' with value '([^\']+)'$/, function (option, value) {
        this.flags = (this.flags ? this.flags : '') + ' --' + option + ' ' + value;
    });

    this.Given(/^I have a pending job$/, function () {
        this.image = 'missing-image';
        this.script = 'missing-script';
        return Promise.resolve();
    });

    this.Given(/^I have a succeeding job$/, function () {
        this.image = defaultImage;
        return writeSucceedingScript(this);
    });

    this.Given(/^I have a failing job$/, function () {
        this.image = defaultImage;
        return writeFailingScript(this);
    });

    this.Given(/^I have a job with errors$/, {timeout: two_minutes}, function () {
        var world = this;
        this.image = defaultImage;
        return leaveRunning().then(function () {
            return writeFailingScript(world);
        });
    });

    this.When(/^I run the job$/, {timeout: two_minutes}, function () {
        var world = this;

        return executeJob(world.image, world.script, world.flags).then(function (stdout) {
            world.stdout = stdout;
            return Promise.resolve();
        }, function (error) {
            if (error.stdout) {
                world.stdout = error.stdout;
            }
            world.error = error;
            return Promise.resolve();
        });
    });

    this.Then(/^I should get a completion status of '(\w*)'$/, function (status) {
        return parseResult(this.stdout).then(function (result) {
            if (result.status === status) {
                return Promise.resolve();
            } else {
                return Promise.reject(new Error('Expected the completion status to be \'' + status + '\' but the job returned \'' + result.status + '\''));
            }
        });
    });

    this.Then(/^I should get a log containing '(.+)'$/, function (text) {
        return parseResult(this.stdout).then(function (result) {
            if (result.log.indexOf(text) !== -1) {
                return Promise.resolve();
            } else {
                return Promise.reject(new Error('Expected the log to contain \'' + text + '\' in:\n' + result.log));
            }
        });
    });

    this.Then('I should get an interface error saying "$text"', function (text) {
        if (!this.error) {
            return Promise.reject(new Error('Expected an error'));
        }

        if (this.error.message.indexOf(text) !== -1) {
            return Promise.resolve();
        } else {
            return Promise.reject(new Error('Expected an error \'' + text + '\' in:\n' + this.error.message));
        }
    });

    this.Then('I should get a runtime error saying "$text"', function (text) {
        return parseResult(this.error.stdout).then(function (result) {
            if (result.log.indexOf(text) !== -1) {
                return Promise.resolve();
            } else {
                return Promise.reject(new Error('Expected an error \'' + text + '\' in:\n' + result.log));
            }
        });
    });

    this.Then(/^the output should include:$/, function (string) {
        if (this.stdout && this.stdout.indexOf(string) !== -1) {
            return Promise.resolve();
        } else {
            console.log(this.error);
            return Promise.reject(new Error('Expected stdout to include ' + string + ' but got:\n' + this.stdout));
        }
    });
};
