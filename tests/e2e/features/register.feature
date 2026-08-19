Feature: Register
    Testing valid and invalid registration flows

    Scenario: Create an account and sign in
        Given I am on the register page
        When I register with email "test@example.com" and password "Password123!" and confirm password "Password123!"
        Then I should be returned to the login page after registration
        When I sign in with the registered email and password "Password123!"
        Then I should be taken to the job role list

    Scenario Outline: Reject invalid registration details
        Given I am on the register page
        When I register with email "<email>" and password "<password>" and confirm password "<confirmPassword>"
        Then I should see the registration error "<error>"

        Examples:
            | email                 | password     | confirmPassword | error                                           |
            | testexample.com       | Password123! | Password123!    | Email must be a valid email format             |
            | candidate@example.com | Password123! | Different123!   | Passwords do not match                         |
            | candidate@example.com | weakpass     | weakpass        | Password must be more than 8 characters long   |


