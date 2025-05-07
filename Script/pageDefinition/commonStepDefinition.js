const { Given, When, Then, Before } = require('@cucumber/cucumber');
const { GenericMethods } = require('../commonUtilities/genericMethods.js');
const { defaultTime } = require('../../TestData/userConfig.js');
let genericMethods;
require('../hooks/hooks.js');
Before(async function() {
	genericMethods = new GenericMethods(parentpage);
});

When('I set the value of the text box with locator {string} to {string} from the page {string}', async function(locator, input, filename) {
	await genericMethods.setValueTextBox(locator, input, filename);
});
When('I click on the element with locator {string} from the page {string}', async function(locator, filename) {
	this.locator = locator;
	await genericMethods.clickElement(locator, filename);
});
When('I click the locator {string} from the page {string} if it is {string}', async function(locator, filename, condition) {
	await genericMethods.clickIf(locator, filename, condition);
});

When('I wait for the element with locator {string} from page {string}', async function(locator, filename) {
	await genericMethods.waitForElementToAppear(locator, filename);
});

When('I scrollToElement with locator {string} from page {string}', async function(locator, filename) {
	await genericMethods.scrollToElement(locator, filename);
});
When('I validateElementState with locator {string} from page {string} with validation type {string}', async function(locator, filename, validationType) {
	const normalizedValidationType = validationType.toUpperCase();
	await genericMethods.validateElementState(locator, filename, normalizedValidationType);
});

Then('I wait for loading elements to disappear', async function() {
	await genericMethods.waitForLoadingElementsHC(this.page);
});
Then('I validate the following elements on the {string} page:', async function(pageName, dataTable) {
	const rows = dataTable.hashes();
	for (const row of rows) {
		await genericMethods.validateElementState(row.locator, pageName, row.validationType.toUpperCase());
	}
});
When('I set the value of the following text boxes on the {string} page:', async function(pageName, dataTable) {
	const rows = dataTable.hashes();
	for (const row of rows) {
		await genericMethods.setValueTextBox(row.locator, row.input, pageName);
	}
});
When('I wait for the page to finish loading with locator {string} from the page {string}',
	async function(locatorName, filename) {
	  await genericMethods.waitForLoadingElements(locatorName, filename);
});