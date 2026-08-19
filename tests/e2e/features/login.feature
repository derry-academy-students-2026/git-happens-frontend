Feature: Login
  People can access job roles with a valid account.

  Scenario: Sign in with valid credentials
    Given I am on the login page
    When I sign in with email "test1@example.com" and password "password123!"
    Then I should be taken to the job role list

  Scenario: Reject invalid credentials
    Given I am on the login page
    When I sign in with email "<email>" and password "<password>"
    Then I should see an invalid credentials message

    Examples:
    |email              |password     |
    |invalid@example.com|wrongpassword|
    |test1@example.com  |wrongpassword|
    |invalid@example.com|Password123! |

  Scenario: Keep job roles protected after a failed login
    Given I have attempted to sign in with invalid credentials
    When I visit the protected job role list
    Then I should be returned to the login page for the job role list