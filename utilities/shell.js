
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

var execute = function (command, options) {
    return new Promise(function (resolve, reject) {
        require('child_process').exec(command, options, function (error, stdout, stderr) {
            if (error) {
                Object.assign(error, {
                    stdout: stdout,
                    stderr: stderr
                });
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    });
};
module.exports.execute = execute;
