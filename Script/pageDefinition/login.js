const {
	Given,
	Before
} = require('@cucumber/cucumber');
const {
	LoginPage
} = require('../pageObjects/login.js');
let login;
require('../hooks/hooks.js');
Before(async function() {
	login = new LoginPage(parentpage);
});
//Step definitions for Login Page
Given('I Launch the application', async function() {
	await login.loginIntoApplication();
});