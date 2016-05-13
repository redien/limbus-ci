
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
    if vagrant -v | grep 'Vagrant 1\.4' > /dev/null; then
        # On vagrant 1.4.x we have to specify a box URL
        vagrant box add $1 $2 --provider virtualbox > $status_file_path 2>&1
    else
        # On newer vagrant versions however, we just get the latest box version
        vagrant box add --provider virtualbox $1 > $status_file_path 2>&1
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
    download_image bodgit/openbsd-5.8-amd64 https://vagrantcloud.com/bodgit/boxes/openbsd-5.8-amd64/versions/1.0.0/providers/virtualbox.box
    download_image bodgit/openbsd-5.9-amd64 https://vagrantcloud.com/bodgit/boxes/openbsd-5.9-amd64/versions/1.0.1/providers/virtualbox.box
    download_image bento/fedora-21 https://vagrantcloud.com/bento/boxes/fedora-21/versions/2.2.3/providers/virtualbox.box
    download_image bento/fedora-22 https://vagrantcloud.com/bento/boxes/fedora-22/versions/2.2.3/providers/virtualbox.box
    download_image bento/fedora-23 https://vagrantcloud.com/bento/boxes/fedora-23/versions/2.2.6/providers/virtualbox.box
    download_image bento/centos-5.11 https://vagrantcloud.com/bento/boxes/centos-5.11/versions/2.2.6/providers/virtualbox.box
    download_image bento/centos-6.7 https://vagrantcloud.com/bento/boxes/centos-6.7/versions/2.2.6/providers/virtualbox.box
    download_image bento/centos-7.1 https://vagrantcloud.com/bento/boxes/centos-7.1/versions/2.1.20150713212346/providers/virtualbox.box
    download_image bento/centos-7.2 https://vagrantcloud.com/bento/boxes/centos-7.2/versions/2.2.6/providers/virtualbox.box
    download_image bento/freebsd-9.3 https://vagrantcloud.com/bento/boxes/freebsd-9.3/versions/2.2.6/providers/virtualbox.box
    download_image bento/freebsd-10.2 https://vagrantcloud.com/bento/boxes/freebsd-10.2/versions/2.2.3/providers/virtualbox.box
    download_image bento/freebsd-10.3 https://vagrantcloud.com/bento/boxes/freebsd-10.3/versions/2.2.6/providers/virtualbox.box
    download_image bento/debian-7.8 https://vagrantcloud.com/bento/boxes/debian-7.8/versions/2.2.1/providers/virtualbox.box
    download_image bento/debian-8.1 https://vagrantcloud.com/bento/boxes/debian-8.1/versions/2.2.1/providers/virtualbox.box
    download_image bento/debian-8.3 https://vagrantcloud.com/bento/boxes/debian-8.3/versions/2.2.5/providers/virtualbox.box
    download_image bento/debian-8.4 https://vagrantcloud.com/bento/boxes/debian-8.4/versions/2.2.6/providers/virtualbox.box
    download_image bento/ubuntu-12.04 https://vagrantcloud.com/bento/boxes/ubuntu-12.04/versions/2.2.6/providers/virtualbox.box
    download_image bento/ubuntu-14.04 https://vagrantcloud.com/bento/boxes/ubuntu-14.04/versions/2.2.6/providers/virtualbox.box
    download_image bento/ubuntu-16.04 https://vagrantcloud.com/bento/boxes/ubuntu-16.04/versions/2.2.6/providers/virtualbox.box
    touch $acceptance_image_lock_path
fi
