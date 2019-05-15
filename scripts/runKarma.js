const { config, Server } = require('karma');
const path = require('path');

const istanbulLibCoverage= require('istanbul-lib-coverage');
const istanbulLibReport = require('istanbul-lib-report');
const istanbulReports = require('istanbul-reports');

// Start with blank coverage map
const map = istanbulLibCoverage.createCoverageMap({});

const karmaConfig = config.parseConfig(path.resolve(__dirname, '..', 'karma.conf.js'));

const server = new Server(karmaConfig, exitCode => {
  console.log('Karma exited with code: ', exitCode);
  var options = {
    dir: path.resolve(__dirname, '..', 'coverage', 'web'),
  };
  var context = istanbulLibReport.createContext(options)
  var tree = istanbulLibReport.summarizers.pkg(map)
  tree.visit(istanbulReports.create('json', options), context)
  tree.visit(istanbulReports.create('lcovonly', options), context)
  process.exit(exitCode);
});

server.on('coverage_complete', (browser, coverageReport) => {
  console.log('Completed Coverage for browser: %s', browser);
  map.merge(coverageReport)
});

server.start();
