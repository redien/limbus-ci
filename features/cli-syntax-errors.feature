
# limbus-ci - A simple CI solution for testing extremely portable applications.
# Written in 2016 by Jesper Oskarsson jesosk@gmail.com
#
# To the extent possible under law, the author(s) have dedicated all copyright
# and related and neighboring rights to this software to the public domain worldwide.
# This software is distributed without any warranty.
#
# You should have received a copy of the CC0 Public Domain Dedication along with this software.
# If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.

Feature: CLI Syntax Errors
    As a user of limbus-ci
    I want to get errors when I run the CLI commands incorrectly
    So that I can correct my mistakes

    Scenario: Running a job without an image
        Given I do not supply an image
        When I run the job
        Then I should get an interface error saying "error: missing required argument `image'"

    Scenario: Running a job without a script
        Given I supply an image
        And I do not supply a script
        When I run the job
        Then I should get an interface error saying "error: missing required argument `script'"

    Scenario: Running a job with unknown option
        Given I use the option 'unknown' with value 'nil'
        When I run the job
        Then I should get an interface error saying "error: unknown option `--unknown'"
