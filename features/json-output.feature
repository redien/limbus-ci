
# limbus-ci - A simple CI solution for testing extremely portable applications.
# Written in 2016 by Jesper Oskarsson jesosk@gmail.com
#
# To the extent possible under law, the author(s) have dedicated all copyright
# and related and neighboring rights to this software to the public domain worldwide.
# This software is distributed without any warranty.
#
# You should have received a copy of the CC0 Public Domain Dedication along with this software.
# If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.

Feature: JSON Output
    As a user of limbus-ci
    I want the jobs to output JSON
    So that I can easily use the output programmatically

    Scenario: Status pending
        Given I have a pending job
        When I run the job
        Then the output should include:
        """
        {"status":"pending"}
        """

    Scenario: Status success
        Given I have a succeeding job
        When I run the job
        Then the output should include:
        """
        {"status":"success",
        """

    Scenario: Status failure
        Given I have a failing job
        When I run the job
        Then the output should include:
        """
        {"status":"failure",
        """

    Scenario: Status error
        Given I have a job with errors
        When I run the job
        Then the output should include:
        """
        {"status":"error",
        """
