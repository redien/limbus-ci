
# limbus-ci - A simple CI solution for testing extremely portable applications.
# Written in 2016 by Jesper Oskarsson jesosk@gmail.com
#
# To the extent possible under law, the author(s) have dedicated all copyright
# and related and neighboring rights to this software to the public domain worldwide.
# This software is distributed without any warranty.
#
# You should have received a copy of the CC0 Public Domain Dedication along with this software.
# If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.

Feature: Completion Status Error
    As a user of limbus-ci
    I want to get a completion status of 'error' when an error occurs
    So that I know which jobs could not be started

    Scenario: A previous job is left running
        Given a previous job is left running
        And I supply an image
        And I supply a succeeding script
        When I run the job
        Then I should get a completion status of 'error'
        And I should get a runtime error saying "a job is already running"
