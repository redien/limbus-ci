
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

var execute = Promise.denodeify(require('child_process').exec);
var readFile = Promise.denodeify(require('fs').readFile);
var writeFile = Promise.denodeify(require('fs').writeFile);

var parseResult = function (stdout) {
    return JSON.parse(stdout);
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
        this.script = 'generated/succeeding_script.sh';
        return writeFile(this.script, 'echo Success');
    });

    this.Given(/^I supply a missing image$/, function () {
        this.image = 'missing-image';
        return Promise.resolve();
    });

    this.When(/^I run the job$/, function () {
        var world = this;

        var jobCommand = [
            './bin/limbus-ci run job',
            world.image,
            world.script
        ].join(' ');

        return execute(jobCommand).then(function (stdout) {
            world.result = parseResult(stdout);
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
