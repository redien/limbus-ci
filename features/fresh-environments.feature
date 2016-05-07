
# limbus-ci - A simple CI solution for testing extremely portable applications.
# Written in 2016 by Jesper Oskarsson jesosk@gmail.com
#
# To the extent possible under law, the author(s) have dedicated all copyright
# and related and neighboring rights to this software to the public domain worldwide.
# This software is distributed without any warranty.
#
# You should have received a copy of the CC0 Public Domain Dedication along with this software.
# If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.

Feature: Fresh Environments
    As a user of limbus-ci
    I want the jobs to have completely fresh environments when I run them
    So that they cannot find any data from a previous job

    Scenario: A file is left behind by a previous job
        Given I supply an image
        And I supply a script that writes a file
        And I run the job
        And I supply a script that makes sure that the file does not exist
        When I run the job
        Then I should get a completion status of 'success'
