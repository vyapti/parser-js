const path = require('path');
const { FileParser, ReportMode } = require('../../dist/esm5'); // TODO: replace with "@vyapti/parser"
const { displayReportData } = require('../web/displayReport');

// Setup
const fp = new FileParser();
const lcovFilePath = path.resolve(__dirname, '..', 'web', 'lcov.info');

// Option Configuration:
const options = {
  rootDirectory: 'vyapti/parser',
  encoding: 'ascii',
  mode: ReportMode.Detail,
};

// Synchronous Example
// const report = fp.parseSync(lcovFilePath, options);
// displayReportData(report);

// Asynchronous Example
fp.parse(lcovFilePath, options).then(displayReportData);
