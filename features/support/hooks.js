
var shell = require('../../utilities/shell');
var fs = require('../../utilities/filesystem');

module.exports = function () {
    this.Before(function () {
        return fs.deleteFile('temp/Vagrantfile').then(function () {
            return shell.execute('vagrant init', {cwd: 'temp'});
        }).then(function () {
            return shell.execute('vagrant destroy -f', {cwd: 'temp'});
        });
    });
}
