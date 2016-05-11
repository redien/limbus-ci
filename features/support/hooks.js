
var shell = require('../../utilities/shell');
var fs = require('../../utilities/filesystem');

var limbusCiDirectoryPath = 'temp/.limbusci';

module.exports = function () {
    this.Before({timeout: 60 * 1000}, function () {
        return fs.deleteFile(limbusCiDirectoryPath + '/Vagrantfile').then(function () {
            return shell.execute('vagrant init', {cwd: limbusCiDirectoryPath});
        }).then(function () {
            return shell.execute('vagrant destroy -f', {cwd: limbusCiDirectoryPath});
        });
    });
}
