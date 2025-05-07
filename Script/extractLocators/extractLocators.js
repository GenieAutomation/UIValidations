const fs = require('fs');
const path = require('path');
const extractLocators = (script) => {
	const locators = {};
	const lines = script.split('\n');
	lines.forEach(line => {
		let fragments = line.split('.');
		fragments.forEach(fragment => {
			if (fragment.includes('getByRole')) {
				const roleMatch = fragment.match(/getByRole\(['"`]([^'"`]+)['"`]/);
				const nameMatch = fragment.match(/{\s*name:\s*['"`]([^'"`]+)['"`]/);
				if (roleMatch && nameMatch) {
					const role = roleMatch[1];
					const name = nameMatch[1];
					const cleanName = name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s(.)/g, (group1) => group1.toUpperCase()).replace(/^([A-Z])/, (match) => match.toLowerCase()).replace(/([A-Z])/g, ' $1').trim().replace(/[^a-zA-Z0-9_]/g, '').replace(/\s+/g, '').replace(/_/g, '');
					const elementType = role.charAt(0).toUpperCase() + role.slice(1);
					const key = `${cleanName}${elementType}`;
					locators[key] = {
						role: role,
						name: name
					};
				}
			} else if (fragment.includes('getByLabel')) {
				const labelMatch = fragment.match(/getByLabel\(['"`]([^'"`]+)['"`]/);
				if (labelMatch) {
					const label = labelMatch[1];
					const cleanLabel = label.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s(.)/g, (group1) => group1.toUpperCase()).replace(/^([A-Z])/, (match) => match.toLowerCase()).replace(/([A-Z])/g, ' $1').trim().replace(/[^a-zA-Z0-9_]/g, '').replace(/\s+/g, '').replace(/_/g, '');
					const key = `${cleanLabel}Label`;
					locators[key] = {
						label: label
					};
				}
			} else if (fragment.includes('getByText')) {
				const start = fragment.indexOf('getByText(') + 'getByText('.length;
				const end = fragment.indexOf(')', start);
				const textWithOptions = fragment.slice(start, end).trim();
				const textMatch = textWithOptions.match(/'([^']+)'/);
				const optionsMatch = textWithOptions.match(/{([^}]+)}/);
				if (textMatch) {
					const text = textMatch[1];
					let options = {};
					if (optionsMatch) {
						const optionsStr = optionsMatch[1];
						const optionsArray = optionsStr.split(',').map(option => option.trim());
						optionsArray.forEach(option => {
							const [key, value] = option.split(':').map(item => item.trim());
							options[key] = value === 'true';
						});
					}
					// Ensure camelCase format
					const key = `${text.replace(/\s+/g, '')}Text`.replace(/[^a-zA-Z0-9_]/g, '').replace(/\s+/g, '').replace(/_/g, '').replace(/([A-Z])/g, (match, index) => index === 0 ? match.toLowerCase() : match); 
					locators[key] = {
						"text": text,
						...options
					};
				}
			} else if (fragment.includes('locator') && !fragment.includes('contentFrame')) {
				const selectorMatch = fragment.match(/locator\(['"`](.*?)['"`]\)/);
				if (selectorMatch) {
					const selector = selectorMatch[1];
					const key = selector.replace(/[^a-zA-Z0-9_]/g, '');
					locators[key] = `'${selector}'`;
				}
			} else {
				console.log('No match for fragment:', fragment);
			}
		});
	});
	return locators;
};
const processScript = async (inputFile, outputFile) => {
	try {
		const script = fs.readFileSync(inputFile, 'utf-8');
		console.log('Read script from file:', script);
		const locators = extractLocators(script);
		if (Object.keys(locators).length === 0) {
			console.log('No locators were found in the script.');
		}
		let outputContent = `const locators = {\n`;
		for (const [key, value] of Object.entries(locators)) {
			if (typeof value === 'string') {
				outputContent += `  ${key}: ${value},\n`;
			} else {
				outputContent += `  ${key}: ${JSON.stringify(value)},\n`;
			}
		}
		outputContent += `};\n\nmodule.exports = {\n  locators\n};`;
		fs.writeFileSync(outputFile, outputContent, 'utf-8');
		console.log(`Locators extracted successfully to ${outputFile}`);
	} catch (error) {
		console.error('Error processing script:', error);
	}
};
const inputFile = path.join(__dirname, `../extractLocators/input.txt`);
const outputFile = path.join(__dirname, `../extractLocators/New.js`);
processScript(inputFile, outputFile);