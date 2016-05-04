
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

var stat = Promise.denodeify(require('fs').stat);
module.exports.stat = stat;

var unlink = Promise.denodeify(require('fs').unlink);
module.exports.unlink = unlink;

var writeFile = Promise.denodeify(require('fs').writeFile);
module.exports.writeFile = writeFile;

var readFile = Promise.denodeify(require('fs').readFile);
module.exports.readFile = readFile;

var copyFile = function (source, destination) {
    return readFile(source).then(function (contents) {
        return writeFile(destination, contents);
    });
};
module.exports.copyFile = copyFile;

var exists = function (path) {
    return stat(path).then(function (stats) {
        return Promise.resolve(true);
    }, function () {
        return Promise.resolve(false);
    });
};
module.exports.exists = exists;

var deleteFile = function (path) {
    return exists(path).then(function (exists) {
        if (exists) {
            return unlink(path);
        } else {
            return Promise.resolve();
        }
    });
};
module.exports.deleteFile = deleteFile;
