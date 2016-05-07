
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

var two_minutes = 2 * 60 * 1000;

var parseResult = function (stdout) {
    try {
        return Promise.resolve(JSON.parse(stdout));
    } catch (error) {
        return Promise.reject(new Error('Got error "' + error.message + '" trying to parse:\n' + stdout));
    }
};

module.exports = function () {
    this.Given(/^I do not supply an image$/, function () {
        this.image = '';
        return Promise.resolve();
    });

    this.Given(/^I supply an image$/, function () {
        this.image = 'hashicorp/precise64';
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
        this.script = 'succeeding_script.sh';
        return fs.writeFile('temp/' + this.script, '#!/bin/sh\necho Success');
    });

    this.Given(/^I supply a failing script$/, function () {
        this.script = 'failing_script.sh';
        return fs.writeFile('temp/' + this.script, '#!/bin/sh\ncommand-that-does-not-exist-should-fail');
    });

    this.Given(/^I supply a script with the contents:$/, function (contents) {
        this.script = 'script.sh';
        return fs.writeFile('temp/' + this.script, contents);
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

    this.When(/^I run the job$/, {timeout: two_minutes}, function () {
        var world = this;

        var jobCommand = [
            '../bin/limbus-ci job',
            world.image,
            world.script
        ].join(' ');

        return shell.execute(jobCommand, {cwd: 'temp'}).then(function (stdout) {
            world.stdout = stdout;
            return Promise.resolve();
        }, function (error) {
            world.error = error;
            return Promise.resolve();
        });
    });

    this.Then(/^I should get a completion status of '(\w*)'$/, function (status) {
        if (this.error) {
            return Promise.reject(error);
        }

        return parseResult(this.stdout).then(function (result) {
            if (result.status === status) {
                return Promise.resolve();
            } else {
                return Promise.reject(new Error('Expected the completion status to be \'' + status + '\' but the job returned \'' + result.status + '\''));
            }
        });
    });

    this.Then(/^I should get a log containing '(.+)'$/, function (text) {
        if (this.error) {
            return Promise.reject(error);
        }

        return parseResult(this.stdout).then(function (result) {
            if (result.stdout.indexOf(text) !== -1) {
                return Promise.resolve();
            } else {
                return Promise.reject(new Error('Expected the log to contain \'' + text + '\' in:\n' + result.stdout));
            }
        });
    });

    this.Then('I should get an error saying "$text"', function (text) {
        if (this.error.stderr.indexOf(text) !== -1) {
            return Promise.resolve();
        } else {
            return Promise.reject(new Error('Expected an error \'' + text + '\' in:\n' + this.stderr));
        }
    });
};
