const {
	expect
} = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const {defaultTime} = require('../../TestData/userConfig.js');
const testData = require('../../TestData/testData.js');
class GenericMethods {
	constructor(parentpage) {
		this.page = parentpage;
	}
	async getTestDataValue(key) {
		try {
			const testDataPath = path.resolve("./TestData/testData.js");
			delete require.cache[require.resolve(testDataPath)];
			const testData = require(testDataPath);
			const value = key.split(".").reduce((obj, part) => obj?.[part], testData);

			if (value !== undefined) {
				return value;
			} else {
				throw new Error(`Key "${key}" not found in testData.js`);
			}
		} catch (error) {
			console.error("Error in getTestDataValue:", error.message);
			throw error;
		}
	}
	async replaceTestDataString(element) {
		try {
		  if (element.trim().startsWith("testdata@") && !element.includes(" ")) {
			const key = element.trim().substring("testdata@".length);
			const value = await this.getTestDataValue(key);
			console.log(`Replacing exact match testdata@${key} with value: ${value}`);
			return value;
		  }
		  let result = element;
		  let startIndex = 0;
		  while ((startIndex = result.indexOf("testdata@", startIndex)) !== -1) {
			const endIndex = result.indexOf(" ", startIndex);
			const key = endIndex === -1 ? result.substring(startIndex + "testdata@".length) : result.substring(startIndex + "testdata@".length, endIndex);
			const value = await this.getTestDataValue(key);
			console.log(`Replacing testdata@${key} with value: ${value}`);
			result = result.substring(0, startIndex) + value + result.substring(endIndex === -1 ? result.length : endIndex);
			startIndex += value.length;
		  }	  
		  return result;
		} catch (error) {
		  console.error("Error in replaceTestDataString:", error.message);
		  throw error;
		}
	  }
	async processLocator(locatorElement) {
		console.log("Inside processLocator, locatorElement:", locatorElement);
		if (typeof locatorElement === "string" && locatorElement.includes("testdata@")) {
			const key = locatorElement.split("@")[1].split("*")[0].trim();
			console.log("Extracted key:", key);
			return await this.replaceTestDataString(locatorElement, key);
		}
		if (typeof locatorElement === "object") {
			const fieldsToCheck = ["text", "name", "label", "attribute"];
			for (let field of fieldsToCheck) {
				if (locatorElement[field] && locatorElement[field].includes("testdata@")) {
					const keyPart = locatorElement[field].split("@")[1];
					const key = keyPart.split("*")[0].trim();
					console.log(`Found testdata@ key in field '${field}':`, key);
					locatorElement[field] = await this.replaceTestDataString(locatorElement[field], key);
				}
			}
		} else {
			console.log("locatorElement is not a valid string or object with testdata@");
		}
		return locatorElement;
	}
	async readLocator(locator, filename) {
		try {
			let selector = undefined;
			const dataPath = path.resolve(__dirname, `../pageObjects/${filename}.js`);
			const PageObject = require(dataPath);
	
			if (!PageObject.locators[locator]) {
				throw new Error(`Locator "${locator}" not found in Page Object file "${filename}.js"`);
			}
	
			let locatorElement = PageObject.locators[locator];
			locatorElement = await this.processLocator(locatorElement);
	
			if (typeof locatorElement === "string") {
				selector = this.page.locator(locatorElement);
			} else if (typeof locatorElement === "object") {
				if (locatorElement.text) {
					if (locatorElement.exact) {
						selector = this.page.getByText(locatorElement.text, { exact: locatorElement.exact });
					} else if (locatorElement.attribute) {
						selector = this.page.locator(locatorElement.attribute).getByText(locatorElement.text);
					} else {
						selector = this.page.getByText(locatorElement.text);
					}
				} else if (locatorElement.role && locatorElement.name) {
					if (locatorElement.exact) {
						selector = this.page.getByRole(locatorElement.role, {
							name: locatorElement.name,
							exact: locatorElement.exact,
						});
					} else if (locatorElement.attribute) {
						selector = this.page
							.locator(locatorElement.attribute)
							.getByRole(locatorElement.role, {
								name: locatorElement.name,
							});
					} else {
						selector = this.page.getByRole(locatorElement.role, {
							name: locatorElement.name,
						});
					}
				} else if (locatorElement.label) {
					selector = this.page.getByLabel(locatorElement.label);
				} else {
					throw new Error(`Locator for "${locator}" is invalid or unsupported.`);
				}
			} else {
				throw new Error(`Unsupported locator type for "${locator}"`);
			}
	
			return selector;
		} catch (error) {
			console.error("Error in readLocator:", error.message);
			throw error;
		}
	}
		
	async clickElement(locator, filename) {
		try {
			const selector = await this.readLocator(locator, filename);
			await selector.waitFor({ state: "visible" });
			await selector.click();
			console.log(`Clicked on the locator ${locator}`);
		} catch (error) {
			console.error("Error in ClickElement:", error.message);
			throw error;
		}
	}
	async setValueTextBox(locator, input, filename) {
		try {
			if (input.includes("testdata@")) {
				const key = input.split("@")[1];
				const value = await this.getTestDataValue(key);
				input = input.replace(`testdata@${key}`, value);
			} else {
				console.log(`Using input as is: ${input}`);
			}
			//await this.waitForLoadingElements(locator, filename);
			const selector = await this.readLocator(locator, filename);
			await selector.fill(input);
			console.log(`Entered the value on the locator ${locator}`);
		} catch (error) {
			console.error("Error in setValueTextBox:", error.message);
			throw error;
		}
	}
	async clickIf(locator, filename, condition) {
		try {
			const selector = await this.readLocator(locator, filename);
			await selector.waitFor({ state: "visible" });
			const exist = await selector.count();
			const conditionLowerCase = condition.toLowerCase();
			const logAndSkip = (message) => {
				console.log(message);
			};
			if (exist > 0) {
				if (conditionLowerCase === "exist") {
					await selector.click();
					console.log(`Clicked on the locator since it existed: ${locator}`);
				} else if (conditionLowerCase === "visible" && (await selector.isVisible())) {
					await selector.click();
					console.log(`Clicked on the locator since it was visible: ${locator}`);
				} else if (conditionLowerCase === "enabled" && (await selector.isEnabled())) {
					await selector.click();
					console.log(`Clicked on the locator since it was enabled: ${locator}`);
				} else if (conditionLowerCase === "not selected") {
					if (
						(typeof locatorElement === "string" && locatorElement.includes("checkbox")) ||
						(typeof locatorElement === "object" &&
							locatorElement.role === "checkbox" &&
							locatorElement.name)
					) {
						const selected = await selector.isChecked();
						if (!selected) {
							await selector.click();
							console.log(`Clicked on the checkbox since it was not selected: ${locator}`);
						} else {
							console.log("Element is already selected, proceeding to the next step");
						}
					} else {
						logAndSkip(
							"Condition 'notselected' is invalid for the type of locator, proceeding to the next step"
						);
					}
				} else {
					logAndSkip("Condition not met or unrecognized, proceeding to next step.");
				}
			} else {
				logAndSkip("Element does not exist, proceeding to the next step.");
			}
		} catch (error) {
			console.error("Error in clickIf:", error.message);
			throw error;
		}
	}
	async waitForElementToAppear(locator, filename) {
		const timeoutInSec = defaultTime / 1000;
		const pollingTimeInSec = 1;
		if (timeoutInSec <= 0 || pollingTimeInSec <= 0) {
			throw new Error("Invalid timeout or polling interval. Both should be positive numbers.");
		}
		const timeout = timeoutInSec * 1000;
		const pollingInterval = pollingTimeInSec * 1000;
		const state = "visible";
		try {
			await this.waitForLoadingElements(locator, filename);
			const selector = await this.readLocator(locator, filename);
			await selector.waitFor({
				timeout,
				state,
				pollingInterval,
			});
			console.log(`Element appeared successfully with state: ${state}`);
		} catch (error) {
			console.error(`Error in waitForElementToAppear (state: ${state}):`, error.message);
			throw error;
		}
	}
	async validateElementState(locator, filename, validationType, expectedValue = null) {
		try {
			validationType = validationType.toUpperCase();
			const selector = await this.readLocator(locator, filename);
			let elementState;
			let elementTextNum;
			let elementTextAlphaNum;
			let numberTextGreater;
			switch (validationType.toUpperCase()) {
				case "EXIST":
					try {
						await this.waitForLoadingElements(locator, filename);
						await selector.waitFor({ state: "visible" });
						const elementCount = await selector.count();
						elementState = elementCount === 1;
						if (elementState) {
							console.log(`Element with locator "${locator}" found exactly once.`);
						} else {
							console.error(`Element with locator "${locator}" was not found or found more than once.`);
						}
					} catch (error) {
						elementState = false;
						console.error("Error in 'EXIST' validation:", error.message);
					}
					break;
				case "NOT_EXIST":
					try {
						const elementCount = await selector.count();
						elementState = elementCount === 0;
						if (elementState) {
							console.log(`Element with locator "${locator}" is NOT present in the DOM.`);
						} else {
							console.error(`Element with locator "${locator}" was found in the DOM.`);
						}
					} catch (error) {
						elementState = true;
						console.error("Error in 'NOT_EXIST' validation:", error.message);
					}
					break;
				case "VISIBLE":
					try {
						await selector.scrollIntoViewIfNeeded();
						elementState = await selector.isVisible();

						if (elementState) {
							console.log(`Element with locator "${locator}" is visible.`);
						} else {
							console.error(`Element with locator "${locator}" is NOT visible.`);
						}
					} catch (error) {
						elementState = false;
						console.error("Error in 'VISIBLE' validation:", error.message);
					}
					break;
				case "NOT_VISIBLE":
					elementState = !(await selector.isVisible());
					break;
				case "FOCUSED":
					try {
						await this.waitForLoadingElements(locator, filename);
						await selector.waitFor({ state: "visible", timeout: defaultTime });
						elementState = await selector.isFocused();
						if (elementState) {
							console.log(`Element with locator "${locator}" is focused.`);
						} else {
							console.error(`Element with locator "${locator}" is NOT focused.`);
						}
					} catch (error) {
						elementState = false;
						console.error("Error in 'FOCUSED' validation:", error.message);
					}
					break;
				case "NOT_FOCUSED":
					elementState = !(await selector.isFocused());
					break;
				case "SELECTED":
					try {
						await this.waitForLoadingElements(locator, filename);
						await selector.waitFor({ state: "visible", timeout: defaultTime });
						elementState = await selector.isSelected();

						if (elementState) {
							console.log(`Element with locator "${locator}" is selected.`);
						} else {
							console.error(`Element with locator "${locator}" is NOT selected.`);
						}
					} catch (error) {
						elementState = false;
						console.error("Error in 'SELECTED' validation:", error.message);
					}
					break;
				case "NOT_SELECTED":
					elementState = !(await selector.isSelected());
					break;
				case "HIGHLIGHT":
					try {
						await this.waitForLoadingElements(locator, filename);
						await selector.waitFor({ state: "visible", timeout: defaultTime });
						await selector.evaluate((el) => {
							el.style.border = "2px solid red";
							setTimeout(() => {
								el.style.border = "";
							}, 1000);
						});
						elementState = true;
					} catch (error) {
						elementState = false;
						console.error("Error in 'HIGHLIGHT' validation:", error.message);
					}
					break;
				case "ISNUM":
					try {
						await this.waitForLoadingElements(locator, filename);
						await selector.waitFor({ state: "visible", timeout: defaultTime });
						elementTextNum = await selector.textContent();
						elementState = !isNaN(parseFloat(elementTextNum)) && isFinite(elementTextNum);
					} catch (error) {
						elementState = false;
						console.error("Error in 'ISNUM' validation:", error.message);
					}
					break;
				case "ISALPHANUM":
					try {
						await this.waitForLoadingElements(locator, filename);
						await selector.waitFor({ state: "visible", timeout: defaultTime });
						elementTextAlphaNum = await selector.textContent();
						elementState = /^[a-z0-9]+$/i.test(elementTextAlphaNum);
					} catch (error) {
						elementState = false;
						console.error("Error in 'ISALPHANUM' validation:", error.message);
					}
					break;
				case "GREATERTHAN":
					try {
						await this.waitForLoadingElements(locator, filename);
						await selector.waitFor({ state: "visible", timeout: defaultTime });
						if (expectedValue === null) {
							throw new Error("Expected value must be provided for 'GREATERTHAN' validation.");
						}
						numberTextGreater = await selector.textContent();
						elementState = parseFloat(numberTextGreater) > parseFloat(expectedValue);
					} catch (error) {
						elementState = false;
						console.error("Error in 'GREATERTHAN' validation:", error.message);
					}
					break;
				case "ENABLED":
					try {
						await this.waitForLoadingElements(locator, filename);
						await selector.waitFor({ state: "visible", timeout: defaultTime });
						elementState = await selector.isEnabled();
					} catch (error) {
						elementState = false;
						console.error("Error in 'ENABLED' validation:", error.message);
					}
					break;
				case "DISABLED":
					try {
						elementState = !(await selector.isEnabled());
					} catch (error) {
						elementState = false;
						console.error("Error in 'DISABLED' validation:", error.message);
					}
					break;
				default:
					console.error("Invalid validation type:", validationType);
					elementState = false;
					break;
			}
			if (elementState) {
				console.log(`${validationType} validation passed.`);
			} else {
				throw new Error(`${validationType} validation failed.`);
			}
		} catch (error) {
			console.error(`Error in validateElementState: ${error.message}`);
			console.error(`Locator: ${locator}, Filename: ${filename}, Validation: ${validationType}`);
			throw error;
		}
	}
	async scrollToElement(locator, filename) {
		try {
			await this.waitForLoadingElements(locator, filename);
			const selector = await this.readLocator(locator, filename);
			const exist = await selector.count();
			if (exist > 0) {
				const isVisible = await selector.isVisible();
				if (isVisible) {
					await selector.scrollIntoViewIfNeeded();
					console.log(`Scrolled to element with locator: ${locator}`);
				}
			}
		} catch (error) {
			console.error("Error in scrollToElement:", error.message);
			console.error(`Locator: ${locator} from file: ${filename}`);
			throw error;
		}
	}
	async waitForLoadingElements(locator = null, filename = null, timeout = defaultTime) {
		try {
			const loadingSelectors = [
				'[role="progressbar"]',
				".loading",
				".spinner",
				'[aria-busy="true"]',
				".overlay",
				"#loading",
				".modal",
			];
			for (const selector of loadingSelectors) {
				try {
					console.log(`Waiting for loading element ${selector} to disappear.`);
					await this.page.waitForSelector(selector, { state: "hidden", timeout });
				} catch (error) {
					if (error.name === "TimeoutError") {
						console.warn(`Timeout: ${selector} did not disappear. Trying next.`);
					} else {
						console.error(`Error while waiting for selector ${selector}:`, error);
						throw error;
					}
				}
			}
			if (locator && filename) {
				const readyLocator = await this.readLocator(locator, filename);
				await readyLocator.waitFor({ state: "visible", timeout });
			}
		} catch (error) {
			console.error("Error during waitForLoadingElements:", error);
			throw error;
		}
	}
	async waitForLoadingElementsHC() {
		const loadingSelectors = ['[role="progressbar"]', ".loading", ".spinner", '[aria-busy="true"]', ".overlay", "#loading", ".modal",];
		for (const selector of loadingSelectors) {
			try {
				console.log(`Waiting for loading element ${selector} to disappear.`);
				await this.page.waitForSelector(selector, {
					state: "hidden",
					timeout: 5000,
				});
				break;
			} catch (error) {
				console.log(`No element found for selector ${selector}. Trying next one.`);
			}
		}
		await this.page.waitForTimeout(6000);
	}
}
module.exports = {
	GenericMethods
};