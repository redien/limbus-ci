
# limbus-ci - A simple CI solution for testing extremely portable applications.
# Written in 2016 by Jesper Oskarsson jesosk@gmail.com
#
# To the extent possible under law, the author(s) have dedicated all copyright
# and related and neighboring rights to this software to the public domain worldwide.
# This software is distributed without any warranty.
#
# You should have received a copy of the CC0 Public Domain Dedication along with this software.
# If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.

limbusci_directory_path=.limbusci
acceptance_image_lock_path=$limbusci_directory_path/acceptance_test_images_downloaded
status_file_path=$limbusci_directory_path/download_status

mkdir -p $limbusci_directory_path

download_image() {
    echo Downloading $1...
    if vagrant -v | grep 'Vagrant 1\.4'; then
        vagrant box add $1 $2 --provider virtualbox > $status_file_path 2>&1
    else
        vagrant box add --provider virtualbox --name $1 $2 > $status_file_path 2>&1
    fi

    if cat $status_file_path | grep -q "Successfully added box '$1'";
    then
        rm $status_file_path
        return 0
    elif cat $status_file_path | grep -q "already exists";
    then
        rm $status_file_path
        return 0
    else
        echo Failed to download $1
        rm $status_file_path
        exit 1 # If the download failed, exit the script early so that it can be re-run.
    fi
}

if [ ! -f $acceptance_image_lock_path ];
then
    download_image bodgit/openbsd-5.8-amd64
    download_image bodgit/openbsd-5.9-amd64
    download_image bento/fedora-21
    download_image bento/fedora-22
    download_image bento/fedora-23
    download_image bento/centos-5.11
    download_image bento/centos-6.7
    download_image bento/centos-7.1
    download_image bento/centos-7.2
    download_image bento/freebsd-9.3
    download_image bento/freebsd-10.2
    download_image bento/freebsd-10.3
    download_image bento/debian-7.8
    download_image bento/debian-8.1
    download_image bento/debian-8.3
    download_image bento/debian-8.4
    download_image hashicorp/precise64
    download_image bento/ubuntu-14.04
    download_image bento/ubuntu-16.04
    touch $acceptance_image_lock_path
fi
