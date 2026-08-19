Feature: Register
    Testing valid and invalid registration flows

    Scenario: Create an account and sign in
        Given I am on the register page
        When I register with email "test@example.com" and password "Password123!" and confirm password "Password123!"
        Then I should be returned to the login page after registration
        When I sign in with the registered email and password "Password123!"
        Then I should be taken to the job role list

    Scenario Outline: Reject an invalid details
        Given I am on the register page
        When I register with email "<email>" and password "<password>" and confirm password "<confirm-password>"
        Then I should see an invalid details message

        Examples:
        |email                |password     |confirm-password|
        |testexample.com      |Password123! |Password123!    |
        |candidate@example.com|weakpass     |weakpass        |

    Scenario: Reject a password that does not match
        Given I am on the register page
        When I register with email "candidate@example.com" and password "Password123!" and confirm password "Different123!"
        Then I should see a password confirmation error


