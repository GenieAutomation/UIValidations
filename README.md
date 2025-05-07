Script/CommonUtilities/genericMethods.js
Contains reusable utility functions that perform various UI actions. These functions are shared across different test steps.

Script/extractLocators/input.txt
Stores raw code snippets copied directly from Playwright Inspector.
Running the command node Script/extractLocators/extractLocators.js processes this file and generates a New.js file, which contains element locators in a key-value format for easier use.

features/
Houses all .feature files that define test scenarios in Gherkin syntax.

pageDefinition/
Contains step definitions that are directly linked to methods in genericMethods.js, bridging feature files with executable code.

pageObjects/
Maintains Page Object Model (POM) files where UI element locators are centrally defined and managed.

TestData/
Stores static data sets used during test execution.

userConfig/
Contains global configuration settings such as defaultTime, threadCount, browserType, and tag filters for test execution.
