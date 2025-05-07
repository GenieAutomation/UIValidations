const locators = {
	
};
const {
	expect
} = require('@playwright/test');
const {
	testData
} = require('../../TestData/config.js');
class LoginPage {
	constructor(parentpage) {
		this.page = parentpage;
		this.testData = testData;
	}
	async loginIntoApplication() {
		const url = "https://www.americanexpress.com/fr-fr/?inav=NavLogo";
		await this.page.goto(url);
		//await expect(this.page.getByText("Cartes Particuliers", { exact: true })).toBeVisible();
	}
}

module.exports = {
	LoginPage,
	locators
};