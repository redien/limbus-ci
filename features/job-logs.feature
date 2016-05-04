
# limbus-ci - A simple CI solution for testing extremely portable applications.
# Written in 2016 by Jesper Oskarsson jesosk@gmail.com
#
# To the extent possible under law, the author(s) have dedicated all copyright
# and related and neighboring rights to this software to the public domain worldwide.
# This software is distributed without any warranty.
#
# You should have received a copy of the CC0 Public Domain Dedication along with this software.
# If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.

Feature: Job logs
    As a user of limbus-ci
    I want to get a log of the job that I ran
    So that I can track down bugs and verify that it ran properly

    Scenario: Running with a succeeding script
        Given I supply an image
        And I supply a script with the contents:
        """
        echo dzwH9Hel8m8Mm7uwqec6v6aQ8tTzC9hJ
        """
        When I run the job
        Then I should get a log containing 'dzwH9Hel8m8Mm7uwqec6v6aQ8tTzC9hJ'

    Scenario: Running with a failing script
        Given I supply an image
        And I supply a script with the contents:
        """
        echo a7BmPR066MJPX37krMCGFolHBHBcOS4C
        command-that-fails
        """
        When I run the job
        Then I should get a log containing 'a7BmPR066MJPX37krMCGFolHBHBcOS4C'
