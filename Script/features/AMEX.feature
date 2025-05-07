Feature: AMEX Validations

@AMEX
Scenario: AMEX
    Given I Launch the application
    Then I validateElementState with locator "homePageCartesParticuliersText" from page "amex" with validation type "VISIBLE"
    And I click on the element with locator "acceptCookiesPopUp" from the page "amex"
    And I click on the element with locator "cartesParticuliersLink" from the page "amex"
    And I wait for the element with locator "carteslauneText" from page "amex"
    And I scrollToElement with locator "carteGoldAmericannbspLink" from page "amex"
    And I wait for the page to finish loading with locator "carteGoldAmericannbspLink" from the page "amex"
    And I click on the element with locator "carteGoldAmericannbspLink" from the page "amex"
    Then I validateElementState with locator "elleAssureetvousRassureText" from page "amex" with validation type "VISIBLE"
    And I click on the element with locator "demandezVotreCarteLink" from the page "amex"
    Then I validateElementState with locator "MmeText" from page "amex" with validation type "VISIBLE"
    When I set the value of the following text boxes on the "amex" page:
      | locator                                                 | input                               |
      | prnomTextbox                                            | testdata@userInformation.firstName|
      | nomTextbox                                              | testdata@userInformation.lastName   |
      | dateDeNaissanceJJMMAAAATextbox                          | testdata@userInformation.dob   |
      | adresseEmailTextbox                                     | testdata@userInformation.email   |
      | numroDeTlphonePortableTextbox                           | testdata@userInformation.mobileNumber   |
    And I click on the element with locator "sauvegarderEtContinuerButton" from the page "amex"
    Then I validateElementState with locator "radioButtonValidation" from page "amex" with validation type "VISIBLE"
