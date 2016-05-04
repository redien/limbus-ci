
# limbus-ci - A simple CI solution for testing extremely portable applications.
# Written in 2016 by Jesper Oskarsson jesosk@gmail.com
#
# To the extent possible under law, the author(s) have dedicated all copyright
# and related and neighboring rights to this software to the public domain worldwide.
# This software is distributed without any warranty.
#
# You should have received a copy of the CC0 Public Domain Dedication along with this software.
# If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.

Feature: Completion Status Pending
    As a user of limbus-ci
    I want to get a completion status of 'pending' when the job cannot be run
    So that I know which jobs I have left to configure

    Scenario: Running without an image and script
        Given I do not supply an image
        And I do not supply a script
        When I run the job
        Then I should get a completion status of 'pending'

    Scenario: Running with a missing image
        Given I supply a missing image
        And I supply a succeeding script
        When I run the job
        Then I should get a completion status of 'pending'

    Scenario: Running with a missing script
        Given I supply an image
        And I supply a missing script
        When I run the job
        Then I should get a completion status of 'pending'
