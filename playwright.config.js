// @ts-check
import { defineConfig, devices } from '@playwright/test';

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Create a timestamped folder for each test execution
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const date = String(now.getDate()).padStart(2, '0');
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');
//const seconds = String(now.getSeconds()).padStart(2, '0');

// Generate a unique folder name for each test run
const timestamp = `${year}-${month}-${date}_${hours}_${minutes}`;
const reportFolder = path.join(__dirname, 'reports', `Report_${timestamp}`);
const consoleLog = path.join(__dirname, 'reports','console-log.txt');

// Ensure the reports folder exists
fs.mkdirSync(reportFolder, { recursive: true });

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './LMS',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  //retries: process.env.CI ? 2 : 0,
  retries:0,

  /* Opt out of parallel tests on CI. */
  //workers: process.env.CI ? 1 : undefined,
  workers:1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  //reporter: 'html',

  timeout: 1000000,  // 50 seconds default timeout for all actions

  reporter: [
    ['dot'], // Output a simple dot for each test.
    ['json', { outputFile: 'test-results.json' }], // Save the results as JSON.
    //['allure-playwright'],
    //['html', { outputFolder: reportFolder }],// Save HTML report in the Reports folder and open it.
    ['html', { outputFolder: reportFolder, open: 'always' }],
  ],

  use: {
    // Capture a screenshot for every test, whether it passes or fails
    screenshot: 'on', // 'on' captures a screenshot for both passed and failed tests
    trace: 'on', // 'on' will capture trace for every test
    // Record video only for failed tests (can be set to 'always' if needed for all tests)
    video: 'retain-on-failure', // Capture video only for failed tests
  },


  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  //use: {
    
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    //trace: 'on-first-retry',
  //},

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      // contextOptions: {
      // viewport: { width: 1920, height: 1080 },}
    },

  // {
  //     name: 'Microsoft Edge',
  //     use: { ...devices['Desktop Edge'], channel: 'msedge' },
  // },

  /* {
  //   name: 'Google Chrome',
  //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
  // },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    }, */

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },

    {
      name: 'spec1',
      testMatch: '**/AlliedIqqConnector.spec.js',
    },
    {
      name: 'spec2',
      testMatch: '**/CreateApplication.spec.js',
    },
    {
      name: 'spec3',
      testMatch: '**/UserCreation.spec.js',
    },

  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },

  



});

