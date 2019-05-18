const fs = require('fs');
const path = require('path');
const { StreamParser, ReportMode } = require('../../dist/esm5'); // TODO: replace with "@vyapti/parser"
const { displayReportData } = require('../web/displayReport');

// Setup
const sp = new StreamParser();
const lcovFilePath = path.resolve(__dirname, '..', 'web', 'lcov.info');
const stream = fs.createReadStream(lcovFilePath);

// Option Configuration:
const options = {
  rootDirectory: 'vyapti/parser',
  encoding: 'ascii',
  mode: ReportMode.Detail,
};

// Asynchronous Example (Synchronous not supported for streams)
sp.parse(stream, options).then(displayReportData);
