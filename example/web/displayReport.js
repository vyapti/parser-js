const displaySummaryData = summary => {
  const {
    hit: linesHit,
    total: linesTotal,
    details: lineDetails,
  } = summary.line;
  const {
    hit: branchesHit,
    total: branchesTotal,
    details: branchDetails,
  } = summary.branch;
  const {
    hit: functionsHit,
    total: functionsTotal,
    details: functionDetails,
  } = summary.function;
  console.log('==============');
  console.log('Summary for: %s', summary.name || summary.path);
  console.log(
    'Line Data: %d/%d (%d%%)',
    linesHit,
    linesTotal,
    ((100 * (linesHit || 1)) / (linesTotal || linesHit || 1)).toFixed(2),
  );
  if (lineDetails) {
    const totalCount = Object.values(lineDetails).reduce(
      (accum, curr) => accum + curr.executionCount,
      0,
    );
    const avgExecCount = (
      totalCount / (Object.values(lineDetails).length || 1)
    ).toFixed(2);
    const missedLines = Object.values(lineDetails)
      .filter(d => d.executionCount === 0)
      .map(d => d.lineNumber);
    console.log('  Average line execution count: %d', avgExecCount);
    console.log('  Missed lines: ', missedLines);
  }
  console.log(
    'Branch Data: %d/%d (%d%%)',
    branchesHit,
    branchesTotal,
    ((100 * (branchesHit || 1)) / (branchesTotal || branchesHit || 1)).toFixed(2),
  );
  if (branchDetails) {
    const totalCount = Object.values(branchDetails).reduce(
      (accum, curr) => accum + curr.executionCount,
      0,
    );
    const avgExecCount = (
      totalCount / (Object.values(branchDetails).length || 1)
    ).toFixed(2);
    const missedBranches = Object.values(branchDetails)
      .reduce((accum, bd) => {
        const branches = Object.keys(bd.branches).map(branchNumber => ({
          lineNumber: bd.lineNumber,
          executionCount: bd.branches[branchNumber],
          blockNumber: bd.blockNumber,
          branchNumber,
        }));
        return [...accum, ...branches];
      }, [])
      .filter(branch => branch.executionCount === 0)
      .map(
        b =>
          `    Line ${b.lineNumber} - Branch ${b.blockNumber}, Path ${
            b.branchNumber
          }`,
      );
    console.log('  Average branch execution count: %d', avgExecCount);
    console.log('  Missed branches:');
    missedBranches.forEach(b => console.log(b));
  }
  console.log(
    'Function Data: %d/%d (%d%%)',
    functionsHit,
    functionsTotal,
    ((100 * (functionsHit || 1)) / (functionsTotal || functionsHit || 1)).toFixed(2),
  );
  if (functionDetails) {
    const totalCount = Object.values(functionDetails).reduce(
      (accum, curr) => accum + curr.executionCount,
      0,
    );
    const avgExecCount = (
      totalCount / (Object.values(functionDetails).length || 1)
    ).toFixed(2);
    const missedFunctions = Object.values(functionDetails)
      .filter(d => d.executionCount === 0)
      .map(d => `    Line ${d.lineNumber} - ${d.name}`);
    console.log('  Average branch execution count: %d', avgExecCount);
    console.log('  Missed functions:');
    missedFunctions.forEach(f => console.log(f));
  }
};

const displayReportData = report => {
  if (!report) return;
  console.log('%d Paths Tracked', report.paths.length);
  displaySummaryData(report.total);
  const summaries = Object.keys(report.details);
  if (summaries.length < 14) {
    displaySummaryData(report.details[summaries[0]]);
  } else {
    displaySummaryData(report.details[summaries[13]]);
  }
};

// Perform correct export based on environment
try {
  window.displayReportData = displayReportData;
} catch (_) {
  module.exports = {
    displayReportData,
  };
}
