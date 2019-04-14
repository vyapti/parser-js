import { assert, expect } from 'chai';
import 'mocha';

import ReportBuilder from '../../../src/classes/builders/reportBuilder';
import Report from '../../../src/classes/reports/report';
import Summary from '../../../src/classes/summaries/summary';
import { InfoTypes } from '../../../src/utils';

export function reportBuilderTests<
  T extends ReportBuilder,
  U extends Report,
  V extends Summary
>(
  reportCtor: new (dir?: string) => T,
  reportType: new (...params: any[]) => U,
  summaryType: new (...params: any[]) => V,
  summaryTypeChecker?: (d: any) => boolean,
) {
  it('should construct with no root directory passed', () => {
    const rb = new reportCtor();
    expect(rb).to.be.an.instanceOf(reportCtor);
    assert.isDefined(rb.build);
    assert.isDefined(rb.parse);
  });

  it('should construct with root directory passed', () => {
    const rb = new reportCtor('/');
    expect(rb).to.be.an.instanceOf(reportCtor);
    assert.isDefined(rb.build);
    assert.isDefined(rb.parse);
  });

  describe('build', () => {
    let builder: ReportBuilder;

    const testInputForBuildState = (
      name: string,
      input: string,
      shouldBuild: boolean,
    ) => {
      it(`should${
        shouldBuild ? '' : ' not'
      } be able to build after input from: ${name}`, () => {
        builder.parse(input);
        if (shouldBuild) {
          const report = builder.build();
          expect(report).to.be.an.instanceOf(reportType);
          Object.values(report.details).forEach(d => {
            if (summaryTypeChecker) {
              assert.isTrue(summaryTypeChecker(d));
            } else {
              expect(d).to.be.an.instanceOf(summaryType);
            }
          });
        } else {
          expect(() => {
            builder.build();
          }).to.throw('Unable to build report');
        }
      });
    };

    beforeEach(() => {
      builder = new reportCtor();
    });

    testInputForBuildState(
      'Branch Covered',
      `${InfoTypes.BranchCovered}:1,1,0,0`,
      false,
    );
    testInputForBuildState(
      'Branch Found Count',
      `${InfoTypes.BranchFoundCount}:10`,
      false,
    );
    testInputForBuildState(
      'Branch Hit Count',
      `${InfoTypes.BranchHitCount}:10`,
      false,
    );
    testInputForBuildState(
      'Covered Line',
      `${InfoTypes.CoveredLine}:1,0`,
      false,
    );
    testInputForBuildState(
      'Function Found Count',
      `${InfoTypes.FunctionFoundCount}:1`,
      false,
    );
    testInputForBuildState(
      'Function Hit Count',
      `${InfoTypes.FunctionHitCount}:1`,
      false,
    );
    testInputForBuildState(
      'Function Name',
      `${InfoTypes.FunctionName}:1,test`,
      false,
    );
    testInputForBuildState(
      'Function Name Covered',
      `${InfoTypes.FunctionNameCovered}:10:name`,
      false,
    );
    testInputForBuildState(
      'Line Found Count',
      `${InfoTypes.LineFoundCount}:4`,
      false,
    );
    testInputForBuildState(
      'Line Hit Count',
      `${InfoTypes.LineHitCount}:4`,
      false,
    );
    testInputForBuildState(
      'Source File',
      `${InfoTypes.SourceFile}:/test`,
      false,
    );
    testInputForBuildState('Test Name', `${InfoTypes.TestName}:test`, false);
    testInputForBuildState('Empty Line', '', false);

    testInputForBuildState('End Section', `${InfoTypes.EndSection}`, true);

    it('should relate detail paths to root directory if it exists', () => {
      builder = new reportCtor('/test');
      // Enter the first section data
      builder.parse(`${InfoTypes.TestName}:Test1`);
      builder.parse(`${InfoTypes.SourceFile}:/test/test1`);
      builder.parse(`${InfoTypes.EndSection}`);

      // Enter the second section data
      builder.parse(`${InfoTypes.TestName}:Test2`);
      builder.parse(`${InfoTypes.SourceFile}:/test/test2`);
      builder.parse(`${InfoTypes.EndSection}`);

      const report = builder.build();
      expect(report).to.be.an.instanceOf(reportType);
      Object.values(report.details).forEach(d => {
        if (summaryTypeChecker) {
          assert.isTrue(summaryTypeChecker(d));
        } else {
          expect(d).to.be.an.instanceOf(summaryType);
        }
      });
      expect(Object.keys(report.details)).to.have.lengthOf(2);
      expect(report.details).to.have.property('test1');
      expect(report.details).to.have.property('test2');

      const summ1 = report.details.test1;
      const summ2 = report.details.test2;
      expect(summ1.name).to.equal('Test1');
      expect(summ1.path).to.equal('test1');
      expect(summ2.name).to.equal('Test2');
      expect(summ2.path).to.equal('test2');
    });
  });

  describe('parse', () => {
    let builder: T;

    beforeEach(() => {
      builder = new reportCtor();
    });

    describe('for total summary', () => {
      it('should always replace path and name when building summary', () => {
        builder.parse(`${InfoTypes.TestName}:notroot`);
        builder.parse(`${InfoTypes.SourceFile}:/not/root`);
        builder.parse(`${InfoTypes.EndSection}`);
        const report = builder.build();
        expect(report).to.be.an.instanceOf(reportType);
        Object.values(report.details).forEach(d => {
          if (summaryTypeChecker) {
            assert.isTrue(summaryTypeChecker(d));
          } else {
            expect(d).to.be.an.instanceOf(summaryType);
          }
        });
        expect(report.total.name).to.equal('root');
        expect(report.total.path).to.equal('/');
      });

      it('should create combined total summary when parsing multiple sections', () => {
        // Enter the first section data
        builder.parse(`${InfoTypes.TestName}:Test1`);
        builder.parse(`${InfoTypes.SourceFile}:/test1`);
        builder.parse(`${InfoTypes.FunctionFoundCount}:12`);
        builder.parse(`${InfoTypes.FunctionHitCount}:10`);
        builder.parse(`${InfoTypes.LineFoundCount}:10`);
        builder.parse(`${InfoTypes.LineHitCount}:8`);
        builder.parse(`${InfoTypes.BranchFoundCount}:8`);
        builder.parse(`${InfoTypes.BranchHitCount}:6`);
        builder.parse(`${InfoTypes.EndSection}`);

        // Enter the second section data
        builder.parse(`${InfoTypes.TestName}:Test2`);
        builder.parse(`${InfoTypes.SourceFile}:/test2`);
        builder.parse(`${InfoTypes.FunctionFoundCount}:14`);
        builder.parse(`${InfoTypes.FunctionHitCount}:12`);
        builder.parse(`${InfoTypes.LineFoundCount}:15`);
        builder.parse(`${InfoTypes.LineHitCount}:13`);
        builder.parse(`${InfoTypes.BranchFoundCount}:14`);
        builder.parse(`${InfoTypes.BranchHitCount}:12`);
        builder.parse(`${InfoTypes.EndSection}`);

        const report = builder.build();
        expect(report).to.be.an.instanceOf(reportType);
        expect(report.total.name).to.equal('root');
        expect(report.total.path).to.equal('/');
        expect(report.total.function.total).to.equal(26);
        expect(report.total.function.hit).to.equal(22);
        expect(report.total.function.miss).to.equal(4);
        expect(report.total.line.total).to.equal(25);
        expect(report.total.line.hit).to.equal(21);
        expect(report.total.line.miss).to.equal(4);
        expect(report.total.branch.total).to.equal(22);
        expect(report.total.branch.hit).to.equal(18);
        expect(report.total.branch.miss).to.equal(4);
      });
    });

    describe('for detail summaries', () => {
      it('should parse and store separate sections in their own detail summary', () => {
        // Enter the first section data
        builder.parse(`${InfoTypes.TestName}:Test1`);
        builder.parse(`${InfoTypes.SourceFile}:/test1`);
        builder.parse(`${InfoTypes.EndSection}`);

        // Enter the second section data
        builder.parse(`${InfoTypes.TestName}:Test2`);
        builder.parse(`${InfoTypes.SourceFile}:/test2`);
        builder.parse(`${InfoTypes.EndSection}`);

        const report = builder.build();
        expect(report).to.be.an.instanceOf(reportType);
        Object.values(report.details).forEach(d => {
          if (summaryTypeChecker) {
            assert.isTrue(summaryTypeChecker(d));
          } else {
            expect(d).to.be.an.instanceOf(summaryType);
          }
        });
        expect(Object.keys(report.paths)).to.have.lengthOf(2);
        expect(report.paths).to.contain('/test1');
        expect(report.paths).to.contain('/test2');
      });

      it('should parse and combine detail summaries that share the same path', () => {
        // Enter the first section data
        builder.parse(`${InfoTypes.TestName}:Test1`);
        builder.parse(`${InfoTypes.SourceFile}:/test1`);
        builder.parse(`${InfoTypes.FunctionFoundCount}:12`);
        builder.parse(`${InfoTypes.FunctionHitCount}:10`);
        builder.parse(`${InfoTypes.LineFoundCount}:10`);
        builder.parse(`${InfoTypes.LineHitCount}:8`);
        builder.parse(`${InfoTypes.BranchFoundCount}:8`);
        builder.parse(`${InfoTypes.BranchHitCount}:6`);
        builder.parse(`${InfoTypes.EndSection}`);

        // Enter the second section data
        builder.parse(`${InfoTypes.TestName}:Test1`);
        builder.parse(`${InfoTypes.SourceFile}:/test1`);
        builder.parse(`${InfoTypes.FunctionFoundCount}:14`);
        builder.parse(`${InfoTypes.FunctionHitCount}:12`);
        builder.parse(`${InfoTypes.LineFoundCount}:15`);
        builder.parse(`${InfoTypes.LineHitCount}:13`);
        builder.parse(`${InfoTypes.BranchFoundCount}:14`);
        builder.parse(`${InfoTypes.BranchHitCount}:12`);
        builder.parse(`${InfoTypes.EndSection}`);

        const report = builder.build();
        expect(report).to.be.an.instanceOf(reportType);
        Object.values(report.details).forEach(d => {
          if (summaryTypeChecker) {
            assert.isTrue(summaryTypeChecker(d));
          } else {
            expect(d).to.be.an.instanceOf(summaryType);
          }
        });
        expect(Object.keys(report.details)).to.have.lengthOf(1);
        expect(report.details).to.have.property('/test1');

        const summary = report.details['/test1'];
        expect(summary.name).to.equal('Test1');
        expect(summary.path).to.equal('/test1');
        expect(summary.function.total).to.equal(26);
        expect(summary.function.hit).to.equal(22);
        expect(summary.function.miss).to.equal(4);
        expect(summary.line.total).to.equal(25);
        expect(summary.line.hit).to.equal(21);
        expect(summary.line.miss).to.equal(4);
        expect(summary.branch.total).to.equal(22);
        expect(summary.branch.hit).to.equal(18);
        expect(summary.branch.miss).to.equal(4);
      });
    });
  });
}

describe('ReportBuilder', () => {
  reportBuilderTests(ReportBuilder, Report, Summary);
});
