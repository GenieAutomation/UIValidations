const {
	setDefaultTimeout,
	Before,
	After,
	BeforeStep,
	AfterStep,
	AfterAll
} = require('@cucumber/cucumber');
const {
	chromium
} = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const {
	captureAllScreenshots,
	headlessMode,
	defaultTime,
	browserType
} = require('../../TestData/userConfig.js');
const reporter = require("multiple-cucumber-html-reporter");
let page, browser;
setDefaultTimeout(defaultTime);
Before(async function () {
	if (browserType.toLowerCase() === 'chromium') {
		browser = await chromium.launch({
			headless: headlessMode,
			args: ['--start-fullscreen']
		});
	} else {
		if (browserType.toLowerCase() === 'edge') {
			browser = await chromium.launch({
				headless: headlessMode,
				executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
			});
		}
		if (browserType.toLowerCase() === 'firefox') {
			browser = await firefox.launch({
				headless: headlessMode
			});
		}
		if (browserType.toLowerCase() === 'webkit') {
			browser = await webkit.launch({
				headless: headlessMode
			});
		}
	}
	const context = await browser.newContext();
	parentpage = await context.newPage();
	this.page = parentpage;
	console.log('Browser and page initialized');
	return this.page;
});
BeforeStep(async function () {
	try {
		await this.page.waitForLoadState('domcontentloaded', {
			timeout: defaultTime
		});
		await this.page.waitForLoadState('load', {
			timeout: defaultTime
		});
		await this.page.setDefaultTimeout(defaultTime);
		const specificElement = 'body';
		await this.page.waitForSelector(specificElement, {
			timeout: defaultTime,
			state: 'visible'
		});
	} catch (error) {
		console.error('Error while waiting for page to load:', error.message);
		console.log('Screenshot captured for debugging.');
		throw error;
	}
});
AfterStep(async function ({
	pickle,
	result
}) {
	const pages = await this.page.context().pages();
	let page = this.page;
	if (pages.length > 1) {
		page = pages[pages.length - 1];
	}
	await this.page.waitForLoadState('domcontentloaded', {
		timeout: defaultTime
	});
	await this.page.waitForLoadState('load', {
		timeout: defaultTime
	});
	await this.page.setDefaultTimeout(defaultTime);
	if ((captureAllScreenshots && (result.status === 'PASSED' || result.status === 'FAILED')) || result.status === 'FAILED') {
		const sanitizedStepName = pickle.name.replace(/[^a-zA-Z0-9]/g, '_');
		const timestamp = new Date().toISOString().replace(/[-:T.]/g, '_');
		const screenshotDir = path.resolve('./Reports/screenshots');
		if (!fs.existsSync(screenshotDir)) {
			fs.mkdirSync(screenshotDir, {
				recursive: true
			});
		}
		const screenshotPath = path.join(screenshotDir, `${sanitizedStepName}-${timestamp}-${result.status}.png`);
		const screenshot = await page.screenshot({
			path: screenshotPath,
			type: 'png',
		});
		if (this.attach) {
			await this.attach(fs.readFileSync(screenshotPath), 'image/png');
		}
		console.log(`Screenshot saved and attached for step: ${pickle.name}`);
	} else {
		console.log(`Step passed. No screenshot taken for step: ${pickle.name}`);
	}
});
After(async function () {
	console.log('Closing browser...');
	if (browser) {
		await browser.close();
	}
	console.log('Browser closed.');
});
AfterAll(async function () {
	const reportsDir = path.resolve('./Reports');
	const now = new Date();
	const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	const month = months[now.getMonth()];
	const date = String(now.getDate()).padStart(2, '0');
	const year = now.getFullYear();
	let hours = now.getHours();
	const minutes = String(now.getMinutes()).padStart(2, '0');
	const ampm = hours >= 12 ? 'PM' : 'AM';
	hours = hours % 12 || 12;
	const formattedTimestamp = `${year}-${month}-${date}-${hours}-${minutes}-${ampm}`;
	const executionFolder = path.join(reportsDir, `Execution-${formattedTimestamp}`);
	const screenshotsDir = path.resolve('./Reports/screenshots');
	const assetsDir = path.resolve('./Reports/assets');
	try {
		if (!fs.existsSync(executionFolder)) {
			fs.mkdirSync(executionFolder, {
				recursive: true
			});
			console.log(`Execution folder created: ${executionFolder}`);
		}
		const jsonReportPattern = new RegExp(`^cucumber-report.*.json$`);
		const files = fs.readdirSync(reportsDir);
		const jsonReportFile = files.find(file => jsonReportPattern.test(file));
		if (jsonReportFile) {
			const jsonReportPath = path.join(reportsDir, jsonReportFile);
			console.log('JSON report found:', jsonReportFile);
			reporter.generate({
				jsonDir: reportsDir,
				reportPath: reportsDir,
				reportName: 'index.html',
				pageTitle: "Playwright Automation Report",
				displayDuration: false,
				metadata: {
					browser: {
						name: "chrome",
						version: "112",
					},
					device: "Automation",
					platform: {
						name: "Windows",
						version: "10",
					},
				},
				customData: {
					title: "Test Info",
					data: [{
						label: "Project",
						value: "LMS Application"
					}, {
						label: "Release",
						value: "1.2.3"
					}, {
						label: "Cycle",
						value: "Regression"
					}],
				},
			});
			const newJsonReportPath = path.join(executionFolder, jsonReportFile);
			fs.renameSync(jsonReportPath, newJsonReportPath);
			console.log('JSON report moved to the execution folder.');
			const htmlReportFile = path.join(reportsDir, 'index.html');
			if (fs.existsSync(htmlReportFile)) {
				const newHtmlReportPath = path.join(executionFolder, 'index.html');
				fs.renameSync(htmlReportFile, newHtmlReportPath);
				console.log('HTML report moved to the execution folder.');
			} else {
				console.warn('Generated HTML report not found.');
			}
			const featuresFolder = path.join(reportsDir, 'features');
			if (fs.existsSync(featuresFolder)) {
				const newFeaturesFolder = path.join(executionFolder, 'features');
				fs.renameSync(featuresFolder, newFeaturesFolder);
				console.log('Features folder moved to the execution folder.');
			} else {
				console.warn('Features folder not found.');
			}
			if (fs.existsSync(screenshotsDir)) {
				const newScreenshotsDir = path.join(executionFolder, 'screenshots');
				fs.renameSync(screenshotsDir, newScreenshotsDir);
				console.log('Screenshots folder moved to the execution folder.');
			} else {
				console.warn('Screenshots folder not found.');
			}
			if (fs.existsSync(assetsDir)) {
				const newAssetsDir = path.join(executionFolder, 'assets');
				fs.renameSync(assetsDir, newAssetsDir);
				console.log('Assets folder moved to the execution folder.');
			} else {
				console.warn('Assets folder not found.');
			}
		} else {
			console.warn('JSON report not found.');
		}
	} catch (error) {
		console.error("Error during AfterAll hook:", error);
		throw error;
	}
});