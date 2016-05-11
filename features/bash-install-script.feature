
# limbus-ci - A simple CI solution for testing extremely portable applications.
# Written in 2016 by Jesper Oskarsson jesosk@gmail.com
#
# To the extent possible under law, the author(s) have dedicated all copyright
# and related and neighboring rights to this software to the public domain worldwide.
# This software is distributed without any warranty.
#
# You should have received a copy of the CC0 Public Domain Dedication along with this software.
# If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.

Feature: Bash Install Script
    As a user of limbus-ci
    I want to easily install Bash
    So that I can run scripts made for Bash

    Scenario Outline: Install Bash by version
        Given I supply the image '<image>'
        And I supply a script with the contents:
        """
        . ~/install_bash.sh
        type bash
        """
        When I run the job
        Then I should get a completion status of 'success'

        Examples:
            | image |
            | bodgit/openbsd-5.8-amd64 |
            | bodgit/openbsd-5.9-amd64 |
            | bento/fedora-21 |
            | bento/fedora-22 |
            | bento/fedora-23 |
            | bento/centos-5.11 |
            | bento/centos-6.7 |
            | bento/centos-7.1 |
            | bento/centos-7.2 |
            | bento/freebsd-9.3 |
            | bento/freebsd-10.2 |
            | bento/freebsd-10.3 |
            | bento/debian-7.8 |
            | bento/debian-8.1 |
            | bento/debian-8.3 |
            | bento/debian-8.4 |
            | hashicorp/precise64 |
            | bento/ubuntu-14.04 |
            | bento/ubuntu-16.04 |
