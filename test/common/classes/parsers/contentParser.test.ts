import { assert, expect } from 'chai';

import BranchDetail from '../../../../src/classes/details/branchDetail';
import FunctionDetail from '../../../../src/classes/details/functionDetail';
import ContentParser from '../../../../src/classes/parsers/contentParser';
import FlatReport from '../../../../src/classes/reports/flatReport';
import Report from '../../../../src/classes/reports/report';
import TreeReport from '../../../../src/classes/reports/treeReport';
import { InfoTypes, ReportMode } from '../../../../src/utils';

const parserContents = `
  ${InfoTypes.TestName}:testname
  ${InfoTypes.SourceFile}:/root/test
  ${InfoTypes.FunctionName}:12,(anonymous_0)
  ${InfoTypes.FunctionName}:16,(anonymous_1)
  ${InfoTypes.FunctionName}:23,(anonymous_2)
  ${InfoTypes.FunctionName}:29,(anonymous_3)
  ${InfoTypes.FunctionFoundCount}:4
  ${InfoTypes.FunctionHitCount}:2
  ${InfoTypes.FunctionNameCovered}:30,(anonymous_0)
  ${InfoTypes.FunctionNameCovered}:25,(anonymous_1)
  ${InfoTypes.CoveredLine}:12,30
  ${InfoTypes.CoveredLine}:13,30
  ${InfoTypes.CoveredLine}:17,25
  ${InfoTypes.CoveredLine}:19,25
  ${InfoTypes.CoveredLine}:20,23
  ${InfoTypes.CoveredLine}:22,23
  ${InfoTypes.LineFoundCount}:50
  ${InfoTypes.LineHitCount}:35
  ${InfoTypes.BranchCovered}:20,0,0,12
  ${InfoTypes.BranchCovered}:20,0,1,11
  ${InfoTypes.BranchCovered}:34,1,0,2
  ${InfoTypes.BranchCovered}:34,1,1,0
  ${InfoTypes.BranchFoundCount}:4
  ${InfoTypes.BranchHitCount}:3
  ${InfoTypes.EndSection}
`;

const validateTotalSummary = (report: Report) => {
  expect(report.total.branch.total).to.equal(4);
  expect(report.total.branch.hit).to.equal(3);
  expect(report.total.branch.miss).to.equal(1);
  expect(report.total.line.total).to.equal(50);
  expect(report.total.line.hit).to.equal(35);
  expect(report.total.line.miss).to.equal(15);
  expect(report.total.function.total).to.equal(4);
  expect(report.total.function.hit).to.equal(2);
  expect(report.total.function.miss).to.equal(2);
};

const validatePath = (report: Report, path: string) => {
  expect(report.paths).to.have.lengthOf(1);
  expect(report.paths).to.contain(path);
};

const validateBasicSummary = (report: Report, path: string) => {
  expect(report.details).to.have.property(path);

  const detail = report.details[path];
  expect(detail.branch.total).to.equal(4);
  expect(detail.branch.hit).to.equal(3);
  expect(detail.branch.miss).to.equal(1);
  expect(detail.line.total).to.equal(50);
  expect(detail.line.hit).to.equal(35);
  expect(detail.line.miss).to.equal(15);
  expect(detail.function.total).to.equal(4);
  expect(detail.function.hit).to.equal(2);
  expect(detail.function.miss).to.equal(2);
};

const validateDetailSummary = (report: FlatReport, path: string) => {
  expect(report.details).to.have.property(path);

  const detail = report.details[path];
  const bd = detail.branch.details;
  const fd = detail.function.details;
  const ld = detail.line.details;

  expect((bd[20] as BranchDetail).lineNumber).to.equal(20);
  expect((bd[20] as BranchDetail).executionCount).to.equal(23);
  expect((bd[20] as BranchDetail).blockNumber).to.equal(0);
  expect((bd[20] as BranchDetail).branches[0]).to.equal(12);
  expect((bd[20] as BranchDetail).branches[1]).to.equal(11);
  expect((bd[34] as BranchDetail).lineNumber).to.equal(34);
  expect((bd[34] as BranchDetail).executionCount).to.equal(2);
  expect((bd[34] as BranchDetail).blockNumber).to.equal(1);
  expect((bd[34] as BranchDetail).branches[0]).to.equal(2);
  expect((bd[34] as BranchDetail).branches[1]).to.equal(0);

  expect((fd[12] as FunctionDetail).lineNumber).to.equal(12);
  expect((fd[12] as FunctionDetail).executionCount).to.equal(30);
  expect((fd[12] as FunctionDetail).name).to.equal('(anonymous_0)');
  expect((fd[16] as FunctionDetail).lineNumber).to.equal(16);
  expect((fd[16] as FunctionDetail).executionCount).to.equal(25);
  expect((fd[16] as FunctionDetail).name).to.equal('(anonymous_1)');
  expect((fd[23] as FunctionDetail).lineNumber).to.equal(23);
  expect((fd[23] as FunctionDetail).executionCount).to.equal(0);
  expect((fd[23] as FunctionDetail).name).to.equal('(anonymous_2)');
  expect((fd[29] as FunctionDetail).lineNumber).to.equal(29);
  expect((fd[29] as FunctionDetail).executionCount).to.equal(0);
  expect((fd[29] as FunctionDetail).name).to.equal('(anonymous_3)');

  expect(ld[12].lineNumber).to.equal(12);
  expect(ld[12].executionCount).to.equal(30);
  expect(ld[13].lineNumber).to.equal(13);
  expect(ld[13].executionCount).to.equal(30);
  expect(ld[17].lineNumber).to.equal(17);
  expect(ld[17].executionCount).to.equal(25);
  expect(ld[19].lineNumber).to.equal(19);
  expect(ld[19].executionCount).to.equal(25);
  expect(ld[20].lineNumber).to.equal(20);
  expect(ld[20].executionCount).to.equal(23);
  expect(ld[22].lineNumber).to.equal(22);
  expect(ld[22].executionCount).to.equal(23);
};

export const parserTesting = {
  parserContents,
  validateBasicSummary,
  validateDetailSummary,
  validatePath,
  validateTotalSummary,
};

describe('ContentParser', () => {
  let parser: ContentParser;

  beforeEach(() => {
    parser = new ContentParser();
  });

  it('should construct properly', () => {
    parser = new ContentParser();
    expect(parser).to.be.an.instanceOf(ContentParser);
    assert.isDefined(parser.parse);
    assert.isDefined(parser.parseSync);
  });

  describe('parse', () => {
    describe('when passing root directory', () => {
      const validateBasicReport = (report: Report) => {
        validateTotalSummary(report);
        validatePath(report, 'test');
        validateBasicSummary(report, 'test');
      };

      const validateDetailReport = (report: Report) => {
        validateBasicReport(report);
        validateDetailSummary(report as FlatReport, 'test');
      };

      it('should parse contents into a Report by default', async () => {
        const report = await parser.parse(parserContents, {
          rootDirectory: '/root',
        });
        expect(report).to.be.an.instanceOf(Report);
        validateBasicReport(report);
      });

      it('should parse contents into a Report when using Simple Report Mode', async () => {
        const report = await parser.parse(parserContents, {
          mode: ReportMode.Simple,
          rootDirectory: '/root',
        });
        expect(report).to.be.an.instanceOf(Report);
        validateBasicReport(report);
      });

      it('should parse contents into a FlatReport when using Detail Report Mode', async () => {
        const report = await parser.parse(parserContents, {
          mode: ReportMode.Detail,
          rootDirectory: '/root',
        });
        expect(report).to.be.an.instanceOf(FlatReport);
        validateDetailReport(report);
      });

      it('should parse contents into a TreeReport when using Tree Report Mode', async () => {
        const report = await parser.parse(parserContents, {
          mode: ReportMode.Tree,
          rootDirectory: '/root',
        });
        expect(report).to.be.an.instanceOf(TreeReport);
        validateDetailReport(report);
      });
    });

    describe('when not passing root directory', () => {
      const validateBasicReport = (report: Report) => {
        validateTotalSummary(report);
        validatePath(report, '/root/test');
        validateBasicSummary(report, '/root/test');
      };

      const validateDetailReport = (report: Report) => {
        validateBasicReport(report);
        validateDetailSummary(report as FlatReport, '/root/test');
      };

      it('should parse contents into a Report by default', async () => {
        const report = await parser.parse(parserContents);
        expect(report).to.be.an.instanceOf(Report);
        validateBasicReport(report);
      });

      it('should parse contents into a Report when using Simple Report Mode', async () => {
        const report = await parser.parse(parserContents, {
          mode: ReportMode.Simple,
        });
        expect(report).to.be.an.instanceOf(Report);
        validateBasicReport(report);
      });

      it('should parse contents into a FlatReport when using Detail Report Mode', async () => {
        const report = await parser.parse(parserContents, {
          mode: ReportMode.Detail,
        });
        expect(report).to.be.an.instanceOf(FlatReport);
        validateDetailReport(report);
      });

      it('should parse contents into a TreeReport when using Tree Report Mode', async () => {
        const report = await parser.parse(parserContents, {
          mode: ReportMode.Tree,
        });
        expect(report).to.be.an.instanceOf(TreeReport);
        validateDetailReport(report);
      });
    });
  });

  describe('parseSync', () => {
    describe('when passing root directory', () => {
      const validateBasicReport = (report: Report) => {
        validateTotalSummary(report);
        validatePath(report, 'test');
        validateBasicSummary(report, 'test');
      };

      const validateDetailReport = (report: Report) => {
        validateBasicReport(report);
        validateDetailSummary(report as FlatReport, 'test');
      };

      it('should parse contents into a Report by default', () => {
        const report = parser.parseSync(parserContents, {
          rootDirectory: '/root',
        });
        expect(report).to.be.an.instanceOf(Report);
        validateBasicReport(report);
      });

      it('should parse contents into a Report when using Simple Report Mode', () => {
        const report = parser.parseSync(parserContents, {
          mode: ReportMode.Simple,
          rootDirectory: '/root',
        });
        expect(report).to.be.an.instanceOf(Report);
        validateBasicReport(report);
      });

      it('should parse contents into a FlatReport when using Detail Report Mode', () => {
        const report = parser.parseSync(parserContents, {
          mode: ReportMode.Detail,
          rootDirectory: '/root',
        });
        expect(report).to.be.an.instanceOf(FlatReport);
        validateDetailReport(report);
      });

      it('should parse contents into a TreeReport when using Tree Report Mode', () => {
        const report = parser.parseSync(parserContents, {
          mode: ReportMode.Tree,
          rootDirectory: '/root',
        });
        expect(report).to.be.an.instanceOf(TreeReport);
        validateDetailReport(report);
      });
    });

    describe('when not passing root directory', () => {
      const validateBasicReport = (report: Report) => {
        validateTotalSummary(report);
        validatePath(report, '/root/test');
        validateBasicSummary(report, '/root/test');
      };

      const validateDetailReport = (report: Report) => {
        validateBasicReport(report);
        validateDetailSummary(report as FlatReport, '/root/test');
      };

      it('should parse contents into a Report by default', () => {
        const report = parser.parseSync(parserContents);
        expect(report).to.be.an.instanceOf(Report);
        validateBasicReport(report);
      });

      it('should parse contents into a Report when using Simple Report Mode', () => {
        const report = parser.parseSync(parserContents, {
          mode: ReportMode.Simple,
        });
        expect(report).to.be.an.instanceOf(Report);
        validateBasicReport(report);
      });

      it('should parse contents into a FlatReport when using Detail Report Mode', () => {
        const report = parser.parseSync(parserContents, {
          mode: ReportMode.Detail,
        });
        expect(report).to.be.an.instanceOf(FlatReport);
        validateDetailReport(report);
      });

      it('should parse contents into a TreeReport when using Tree Report Mode', () => {
        const report = parser.parseSync(parserContents, {
          mode: ReportMode.Tree,
        });
        expect(report).to.be.an.instanceOf(TreeReport);
        validateDetailReport(report);
      });
    });
  });
});
