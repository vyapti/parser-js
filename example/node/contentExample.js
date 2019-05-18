const fs = require('fs');
const path = require('path');
const { ContentParser, ReportMode } = require('../../dist/esm5'); // TODO: replace with "@vyapti/parser"
const { displayReportData } = require('../web/displayReport');

// Setup
const cp = new ContentParser();
const lcovFilePath = path.resolve(__dirname, '..', 'web', 'lcov.info');
const content = fs.readFileSync(lcovFilePath, { encoding: 'utf8' })

// Option Configuration:
const options = {
  rootDirectory: 'vyapti/parser',
  mode: ReportMode.Detail,
};

// Synchronous Example
// const report = cp.parseSync(content, options);
// displayReportData(report);

// Asynchronous Example
cp.parse(content, options).then(displayReportData);
