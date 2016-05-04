
// limbus-ci - A simple CI solution for testing extremely portable applications.
// Written in 2016 by Jesper Oskarsson jesosk@gmail.com
//
// To the extent possible under law, the author(s) have dedicated all copyright
// and related and neighboring rights to this software to the public domain worldwide.
// This software is distributed without any warranty.
//
// You should have received a copy of the CC0 Public Domain Dedication along with this software.
// If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.

var fs = require('fs');
var child_process = require('child_process');

var execute = function (command) {
    return new Promise(function (resolve, reject) {
        child_process.exec(command, function (error, stdout, stderr) {
            if (error) {
                reject(new Error('"' + command + '"' + ' exited with code ' + error.code + ':\n' + stdout + '\n' + stderr));
            } else {
                resolve({
                    exitCode: 0,
                    stdout: stdout,
                    stderr: stderr
                });
            }
        });
    });
};

var parseResult = function (stdout) {
    return JSON.parse(stdout);
};

module.exports = function () {
    this.Given(/^I do not supply an image to run$/, function () {
        this.image = '';
        return Promise.resolve();
    });

    this.Given(/^I supply a missing image$/, function () {
        this.image = 'missing-image';
        return Promise.resolve();
    });

    this.When(/^I run a job$/, function () {
        var world = this;

        var jobCommand = './bin/limbus-ci run job' + (world.image ? ' ' + world.image : '');

        return execute(jobCommand).then(function (result) {
            world.exitCode = result.exitCode;
            world.stderr = result.stderr;
            world.stdout = result.stdout;
            world.result = parseResult(result.stdout);

            return Promise.resolve();
        });
    });

    this.Then(/^I should get a completion status of '(\w*)'$/, function (status) {
        if (this.result.status === status) {
            return Promise.resolve();
        } else {
            return Promise.reject(new Error('Expected completion status to be \'' + status + '\' but the job returned \'' + world.result.status + '\''));
        }
    });
};
