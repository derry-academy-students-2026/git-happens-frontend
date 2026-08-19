Feature: Register
    People can create an account with valid details

    Scenario: Create account with valid credentials
        Given I am on the register page
        When I register with email "test@example.com" and password "Password123!" and confirm password "Password123!"
        Then I should be returned to the login page after registration

    Scenario: Reject an invalid email
        Given I am on the register page
        When I register with email "testexample.com" and password "Password123!" and confirm password "Password123!"
        Then I should see an invalid details message

    Scenario: Reject a password that does not match
        Given I am on the register page
        When I register with email "candidate@example.com" and password "Password123!" and confirm password "Different123!"
        Then I should see a password confirmation error

    Scenario: Reject a password that does not meet validation requirements
        Given I am on the register page
        When I register with email "candidate@example.com" and password "weakpass" and confirm password "weakpass"
        Then I should see an invalid details message

