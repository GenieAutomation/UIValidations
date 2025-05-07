const fs = require('fs');
const config = require('./TestData/userConfig.js');
const getTimestamp = () => {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
};
const timestamp = getTimestamp();
const retryCount = config.retryCount;
const multiThreadCount = config.multiThreadCount;
const tags = config.tags || '';
let options;
options = ['Script/features', '--require Script/pageDefinition/*.js', '--require Script/hooks/hooks.js', '--format html:./Reports/cucumber-report-' + timestamp + '.html', `--retry ${retryCount}`, `--parallel ${multiThreadCount}`]
if (tags) {
	options.push(`--tags ${tags}`);
}
options = options.join(' ');
module.exports = {
	test_runner: options
};