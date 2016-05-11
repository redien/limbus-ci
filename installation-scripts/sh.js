
// limbus-ci - A simple CI solution for testing extremely portable applications.
// Written in 2016 by Jesper Oskarsson jesosk@gmail.com
//
// To the extent possible under law, the author(s) have dedicated all copyright
// and related and neighboring rights to this software to the public domain worldwide.
// This software is distributed without any warranty.
//
// You should have received a copy of the CC0 Public Domain Dedication along with this software.
// If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.

var indentString = require('indent-string');

var indent_script = function (script) {
    return indentString(script, '   ');
};
module.exports.indent_script = indent_script;

var install_using_script = function (command) {
    return '. /home/vagrant/install_' + command + '.sh\n';
};
module.exports.install_using_script = install_using_script;

var _if = function (expression, commands, else_commands) {
    return 'if ' + expression + '; then\n' +
            indent_script(commands) +
            (else_commands ? 'else\n' + indent_script(else_commands) : '') +
            'fi\n';
};
module.exports._if = _if;

var if_file_exists = function (path, commands, else_commands) {
    return _if('[ -f ' + path + ' ]', commands, else_commands);
};
module.exports.if_file_exists = if_file_exists;

var eval = function (command) {
    return '$(' + command + ')';
};
module.exports.eval = eval;

var if_string_equals = function (string, value, commands, else_commands) {
    return _if('[ "' + string + '" = "' + value + '" ]', commands, else_commands);
};
module.exports.if_string_equals = if_string_equals;

var if_string_not_equals = function (string, value, commands, else_commands) {
    return _if('[ "' + string + '" != "' + value + '" ]', commands, else_commands);
};
module.exports.if_string_not_equals = if_string_not_equals;

var command_exists = function (command, exists, not_exists) {
    return _if(eval('type ' + command + ' > /dev/null 2>&1'),
        exists,
        not_exists
    );
};
module.exports.command_exists = command_exists;

var skip_if_installed = function (command, installation) {
    return command_exists(command,
        'echo ' + command + ' is already installed, skipping installation!\n',
        installation
    );
};
module.exports.skip_if_installed = skip_if_installed;

var download_file = function (url, destination) {
    return '' +
        install_with_package_manager('curl') + // We want to use curl be default as it handles TLS better on some older platforms
        command_exists('curl',
            'curl -sL ' + url + ' > ' + destination + '\n',
            'wget -qO- ' + url + ' > ' + destination + '\n'
        );
};
module.exports.download_file = download_file;

var bash_pipe_install = function (url) {
    return '' +
        install_with_package_manager('curl') + // We want to use curl be default as it handles TLS better on some older platforms
        install_using_script('bash') +
        command_exists('curl',
            'curl -sL ' + url + ' | bash\n',
            'wget -qO- ' + url + ' | bash\n'
        );
};
module.exports.bash_pipe_install = bash_pipe_install;

var on_platform = function (platforms, commands, else_commands) {
    var platformTemplates = {
        'FreeBSD':
            // uname -r | sed 's/^\([0-9]*\.[0-9]*\).*$/\1/'
            if_string_equals(eval('uname -s'), 'FreeBSD',
                commands,
                else_commands
            ),
        'OpenBSD':
            // uname -r
            if_string_equals(eval('uname -s'), 'OpenBSD',
                commands,
                else_commands
            ),
        'Ubuntu':
            // lsb_release -sr
            if_file_exists('/etc/lsb-release',
                if_string_equals(eval('lsb_release -si'), 'Ubuntu',
                    commands,
                    else_commands
                ),
                else_commands
            ),
        'Debian':
            // cat /etc/debian_version
            if_file_exists('/etc/debian_version',
                commands,
                else_commands
            ),
        'RHEL':
            if_file_exists('/etc/redhat-release',
                commands,
                else_commands
            ),
        'CentOS':
            // rpm -qa \*-release | grep "^centos-release" | sed 's/^centos-release-//' | sed 's/^\([0-9]*-[0-9]*\).*$/\1/' | sed 's/-/\./g'
            _if('[ rpm -qa \\*-release | grep centos ]',
                commands,
                else_commands
            )
    };

    if (!Array.isArray(platforms)) {
        platforms = [platforms];
    }

    var script = '';
    platforms.forEach(function (platform) {
        script += platformTemplates[platform];
    });
    return script;
};
module.exports.on_platform = on_platform;

var update_package_manager = function () {
    return '' +
        command_exists('apt-get',
            'sudo apt-get -qq update\n',
        command_exists('pkg',
            'sudo pkg update\n'
        ));
};
module.exports.update_package_manager = update_package_manager;

var install_with_package_manager = function (command, packageName) {
    // Default to the command name for the package to install
    packageName = packageName || command;

    return skip_if_installed(command,
        command_exists('apt-get',
            'sudo apt-get -qq install -y ' + packageName + '\n',
        command_exists('pkg',
            'sudo pkg install --yes ' + packageName + '\n',
        command_exists('pkg_add',
            // PKG_PATH is not set for some reason in provision scripts, so we have to set it manually
            'PKG_PATH=http://ftp.openbsd.org/pub/OpenBSD/$(uname -r)/packages/$(uname -m)/ sudo pkg_add -I ' + packageName + '\n',
        command_exists('yum',
            'sudo yum install -y ' + packageName + '\n'
        ))))
    );
};
module.exports.install_with_package_manager = install_with_package_manager;

var gunzip = function (file) {
    return 'gunzip ' + file + '\n';
};
module.exports.gunzip = gunzip;

var untar = function (file) {
    return 'tar -xf ' + file + '\n';
};
module.exports.untar = untar;

var installScripts = {
    'bash':
        update_package_manager() +
        install_with_package_manager('bash'),
    'git':
        update_package_manager() +
        install_with_package_manager('git'),
    'node':
        skip_if_installed('node',
            on_platform('FreeBSD',
                update_package_manager() +
                install_with_package_manager('node', '$(pkg search -q ^node\\-?$(echo $install_node_version | sed \'s/\\.//g\'))'),

                // Other platforms use nvm...
                bash_pipe_install('https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh') +
                '. ~/.nvm/nvm.sh\n' + // Load nvm into current shell session
                'nvm install $install_node_version > /dev/null 2>&1\n'
            )
        )
};
module.exports.installScripts = installScripts;
