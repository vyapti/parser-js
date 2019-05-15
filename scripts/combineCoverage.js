const fs = require('fs');
const path = require('path');

const glob = require('glob');
const istanbulLibCoverage= require('istanbul-lib-coverage');
const istanbulLibReport = require('istanbul-lib-report');
const istanbulReports = require('istanbul-reports');

const { mergeCoverage } = require('./mergeCoverage');

// Start with blank coverage map
let map = null;

// Get all coverage json files in nested folders
const files = glob.sync(
  'coverage/**/*.json',
  {
    cwd: path.resolve(__dirname, '..'),
    nodir: true,
    ignore: ['**/full-report/*']
  }
);

files.forEach(file => {
  try {
    const contents = fs.readFileSync(file, 'utf-8');
    if (!map) {
      map = JSON.parse(contents);
    } else {
      map = mergeCoverage(map, JSON.parse(contents));
    }
  } catch (err) {
    console.error(err);
  }
});

var options = {
  dir: path.resolve(__dirname, '..', 'coverage', 'full-report'),
};
var context = istanbulLibReport.createContext(options)
var tree = istanbulLibReport.summarizers.pkg(istanbulLibCoverage.createCoverageMap(map))
tree.visit(istanbulReports.create('html', options), context)
tree.visit(istanbulReports.create('json', options), context)
tree.visit(istanbulReports.create('lcovonly', options), context)
tree.visit(istanbulReports.create('text', options), context)
