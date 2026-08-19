Feature: View job specification
  As an applicant I want to find job specification information about each role
  so that I know what is expected for each role.

  Background:
    Given I am signed in and viewing the job role list

  Scenario: Open a job role from the list by its name
    When I click on the first job role name
    Then I should be taken to that job role's specification page

  Scenario: View the specification details for a job role
    When I click on the first job role name
    Then I should see the role details section
    And I should see the following specification details
      | Location       |
      | Capability     |
      | Band           |
      | Closing date   |
      | Open positions |
    And I should see the "Description" specification section
    And I should see the "Responsibilities" specification section

  Scenario: Open the full job specification document in a new tab
    When I click on the first job role name
    Then the job spec link should open in a new tab

  Scenario: Return to the job role list from the specification page
    When I click on the first job role name
    And I choose to go back to all roles
    Then I should be back on the job role list

  Scenario: Show an error page for a job role that does not exist
    When I open the job role specification page for id "99999"
    Then I should see the job role error page

  Scenario: Keep job specifications protected from signed out applicants
    Given I am signed out
    When I open the job role specification page for id "1"
    Then I should be asked to sign in before seeing the specification
