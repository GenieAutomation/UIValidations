const config = {
	/**
	 * @property {boolean} headlessMode
	 * @description Whether the browser should run in headless mode or head mode
	 * Accepted values: 'true' (headless mode), 'false' (with GUI)
	 */
	headlessMode: false,
	/**
	 * @property {number} defaultTime
	 * @description The default time (in milliseconds) for operations like timeouts or delays
	 * Example: '800000' means 800 seconds
	 */
	defaultTime: 30000,
	/**
	 * @property {number} retryCount
	 * @description The number of retry attempts in case of failure
	 * Example: '1' means one retry attempt, '0' means no retries
	 */
	retryCount: 0,
	/**
	 * @property {string} browserType
	 * @description The type of browser to use for automation
	 * Accepted values: 'edge', 'chromium', 'firefox', 'webkit'
	 */
	browserType: "chromium",
	/**
	 * @property {boolean} captureAllScreenshots
	 * @description Whether to capture screenshots during each operation
	 * Accepted values: 'true' (capture screenshots), 'false' (capture screenshots only on failure)
	 */
	captureAllScreenshots: true,
	/**
	 * @property {string} tags
	 * @description The tags to use for filtering scenarios during execution.
	 * Example: '"@Tag1 and @Tag2"' - only scenarios with both tags will be executed.
	 * Example: '"@Tag1 or @Tag2"' - scenarios with either tag will be executed.
	 * Example: '' means no filtering, and all scenarios will be executed.
	 */
	//tags: '"@Collections or @BatchTransactionImport or @BatchTransactionImportReview or @Connectors or @DocumentTemplates or @Originations or @Exports or @Originations or @PublicAPISettings or @ServiceTicketTypes or @WorkdaySchedules"',
	tags: '"@AMEX"',
	/**
	 * @property {number} multiThreadCount
	 * @description The number of threads to use when multi-threading is enabled
	 * Example: '3' means 3 threads will be invoked
	 */
	multiThreadCount: 1
};
module.exports = config;
