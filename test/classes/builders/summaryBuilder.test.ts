import { assert, expect } from 'chai';
import 'mocha';

import SummaryBuilder from '../../../src/classes/builders/summaryBuilder';
import Summary from '../../../src/classes/summaries/summary';
import { InfoTypes } from '../../../src/utils/index';

export function summaryBuilderTests<
  T extends SummaryBuilder,
  U extends Summary
>(
  summaryCtor: new (dir?: string) => T,
  summaryType: new (...params: any[]) => U,
) {
  it('should construct properly with default parameter', () => {
    const sb = new summaryCtor();
    assert.isOk(sb);
    assert.isDefined(sb.canBuild);
    assert.isDefined(sb.build);
    assert.isDefined(sb.parse);
    assert.isFalse(sb.canBuild);
  });

  it('should construct properly with root directory specified', () => {
    const sb = new summaryCtor('/testing');
    assert.isOk(sb);
    assert.isDefined(sb.canBuild);
    assert.isDefined(sb.build);
    assert.isDefined(sb.parse);
    assert.isFalse(sb.canBuild);
  });

  describe('canBuild', () => {
    let builder: SummaryBuilder;

    const testInputForBuildState = (
      name: string,
      input: string,
      shouldAllowBuild: boolean,
    ) => {
      it(`should${
        shouldAllowBuild ? '' : ' not'
      } be able to build after input from: ${name}`, () => {
        builder.parse(input);
        expect(builder.canBuild).to.equal(shouldAllowBuild);
      });
    };

    beforeEach(() => {
      builder = new summaryCtor();
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
  });

  describe('build', () => {
    it('should complete properly when able to build', () => {
      const builder = new summaryCtor();
      builder.parse(`${InfoTypes.TestName}:TestName`);
      builder.parse(`${InfoTypes.SourceFile}:/path/to/test`);
      builder.parse(`${InfoTypes.FunctionFoundCount}:10`);
      builder.parse(`${InfoTypes.FunctionHitCount}:4`);
      builder.parse(`${InfoTypes.LineFoundCount}:11`);
      builder.parse(`${InfoTypes.LineHitCount}:5`);
      builder.parse(`${InfoTypes.BranchFoundCount}:12`);
      builder.parse(`${InfoTypes.BranchHitCount}:6`);
      builder.parse(`${InfoTypes.EndSection}`);

      assert.isTrue(builder.canBuild);
      const summary = builder.build();
      expect(summary).to.be.an.instanceOf(summaryType);
      expect(summary.name).to.equal('TestName');
      expect(summary.path).to.equal('/path/to/test');
      expect(summary.function.total).to.equal(10);
      expect(summary.function.hit).to.equal(4);
      expect(summary.function.miss).to.equal(6);
      expect(summary.line.total).to.equal(11);
      expect(summary.line.hit).to.equal(5);
      expect(summary.line.miss).to.equal(6);
      expect(summary.branch.total).to.equal(12);
      expect(summary.branch.hit).to.equal(6);
      expect(summary.branch.miss).to.equal(6);
    });

    it('should throw an error when unable to build', () => {
      const builder = new summaryCtor();
      assert.isFalse(builder.canBuild);
      expect(() => {
        builder.build();
      }).to.throw('Unable to build');
    });
  });

  describe('parse', () => {
    let builder: SummaryBuilder;

    beforeEach(() => {
      builder = new summaryCtor();
    });

    describe('with Test Name input', () => {
      it('should use default value when just type identifier is passed', () => {
        builder.parse(`${InfoTypes.TestName}`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.name).to.equal('');
      });

      it('should use default value when empty name is passed', () => {
        builder.parse(`${InfoTypes.TestName}:`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.name).to.equal('');
      });

      it('should use name when passed', () => {
        builder.parse(`${InfoTypes.TestName}:testName`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.name).to.equal('testName');
      });

      it('should use last name passed', () => {
        builder.parse(`${InfoTypes.TestName}:testName`);
        builder.parse(`${InfoTypes.TestName}:the real test name`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.name).to.equal('the real test name');
      });
    });

    describe('with Source File input', () => {
      it('should use default value when just type identifier is passed', () => {
        builder.parse(`${InfoTypes.SourceFile}:`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.path).to.equal('/');
      });

      it('should use default when empty file name is given', () => {
        builder.parse(`${InfoTypes.SourceFile}:`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.path).to.equal('/');
      });

      it('should use normalized path when no root directory is specified', () => {
        builder.parse(`${InfoTypes.SourceFile}:/test/../test1/./test`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.path).to.equal('/test1/test');
      });

      it('should use relative path when root directory is specified', () => {
        builder = new summaryCtor('/test1');
        builder.parse(`${InfoTypes.SourceFile}:/test/../test1/./test`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.path).to.equal('test');
      });

      it('should use last path given', () => {
        builder.parse(`${InfoTypes.SourceFile}:/test/../test1/./test`);
        builder.parse(`${InfoTypes.SourceFile}:../test1/./test`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.path).to.equal('../test1/test');
      });
    });

    describe('with Function Found Count', () => {
      it('should use default value when just identifier is passed', () => {
        builder.parse(`${InfoTypes.FunctionFoundCount}`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.function.total).to.equal(0);
        expect(summary.function.miss).to.equal(0);
      });

      it('should use default value when no value is passed', () => {
        builder.parse(`${InfoTypes.FunctionFoundCount}:`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.function.total).to.equal(0);
        expect(summary.function.miss).to.equal(0);
      });

      it('should use default value when invalid format is passed (NaN)', () => {
        builder.parse(`${InfoTypes.FunctionFoundCount}:astring`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.function.total).to.equal(0);
        expect(summary.function.miss).to.equal(0);
      });

      it('should use given value when passed', () => {
        builder.parse(`${InfoTypes.FunctionFoundCount}:40`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.function.total).to.equal(40);
        expect(summary.function.miss).to.equal(40);
      });

      it('should use last given value', () => {
        builder.parse(`${InfoTypes.FunctionFoundCount}:40`);
        builder.parse(`${InfoTypes.FunctionFoundCount}:50`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.function.total).to.equal(50);
        expect(summary.function.miss).to.equal(50);
      });
    });

    describe('with Function Hit Count', () => {
      it('should use default value when just identifier is passed', () => {
        builder.parse(`${InfoTypes.FunctionHitCount}`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.function.hit).to.equal(0);
        expect(summary.function.miss).to.equal(0);
      });

      it('should use default value when no value is passed', () => {
        builder.parse(`${InfoTypes.FunctionHitCount}:`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.function.hit).to.equal(0);
        expect(summary.function.miss).to.equal(0);
      });

      it('should use default value when invalid format is passed (NaN)', () => {
        builder.parse(`${InfoTypes.FunctionHitCount}:astring`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.function.hit).to.equal(0);
        expect(summary.function.miss).to.equal(0);
      });

      it('should use given value when passed', () => {
        builder.parse(`${InfoTypes.FunctionHitCount}:40`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.function.hit).to.equal(40);
        expect(summary.function.miss).to.equal(-40);
      });

      it('should use last given value', () => {
        builder.parse(`${InfoTypes.FunctionHitCount}:40`);
        builder.parse(`${InfoTypes.FunctionHitCount}:50`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.function.hit).to.equal(50);
        expect(summary.function.miss).to.equal(-50);
      });
    });

    describe('with Line Found Count', () => {
      it('should use default value when just identifier is passed', () => {
        builder.parse(`${InfoTypes.LineFoundCount}`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.line.total).to.equal(0);
        expect(summary.line.miss).to.equal(0);
      });

      it('should use default value when no value is passed', () => {
        builder.parse(`${InfoTypes.LineFoundCount}:`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.line.total).to.equal(0);
        expect(summary.line.miss).to.equal(0);
      });

      it('should use default value when invalid format is passed (NaN)', () => {
        builder.parse(`${InfoTypes.LineFoundCount}:astring`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.line.total).to.equal(0);
        expect(summary.line.miss).to.equal(0);
      });

      it('should use given value when passed', () => {
        builder.parse(`${InfoTypes.LineFoundCount}:40`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.line.total).to.equal(40);
        expect(summary.line.miss).to.equal(40);
      });

      it('should use last given value', () => {
        builder.parse(`${InfoTypes.LineFoundCount}:40`);
        builder.parse(`${InfoTypes.LineFoundCount}:50`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.line.total).to.equal(50);
        expect(summary.line.miss).to.equal(50);
      });
    });

    describe('with Line Hit Count', () => {
      it('should use default value when just identifier is passed', () => {
        builder.parse(`${InfoTypes.LineHitCount}`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.line.hit).to.equal(0);
        expect(summary.line.miss).to.equal(0);
      });

      it('should use default value when no value is passed', () => {
        builder.parse(`${InfoTypes.LineHitCount}:`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.line.hit).to.equal(0);
        expect(summary.line.miss).to.equal(0);
      });

      it('should use default value when invalid format is passed (NaN)', () => {
        builder.parse(`${InfoTypes.LineHitCount}:astring`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.line.hit).to.equal(0);
        expect(summary.line.miss).to.equal(0);
      });

      it('should use given value when passed', () => {
        builder.parse(`${InfoTypes.LineHitCount}:40`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.line.hit).to.equal(40);
        expect(summary.line.miss).to.equal(-40);
      });

      it('should use last given value', () => {
        builder.parse(`${InfoTypes.LineHitCount}:40`);
        builder.parse(`${InfoTypes.LineHitCount}:50`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.line.hit).to.equal(50);
        expect(summary.line.miss).to.equal(-50);
      });
    });

    describe('with Branch Found Count', () => {
      it('should use default value when just identifier is passed', () => {
        builder.parse(`${InfoTypes.BranchFoundCount}`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.branch.total).to.equal(0);
        expect(summary.branch.miss).to.equal(0);
      });

      it('should use default value when no value is passed', () => {
        builder.parse(`${InfoTypes.BranchFoundCount}:`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.branch.total).to.equal(0);
        expect(summary.branch.miss).to.equal(0);
      });

      it('should use default value when invalid format is passed (NaN)', () => {
        builder.parse(`${InfoTypes.BranchFoundCount}:astring`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.branch.total).to.equal(0);
        expect(summary.branch.miss).to.equal(0);
      });

      it('should use given value when passed', () => {
        builder.parse(`${InfoTypes.BranchFoundCount}:40`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.branch.total).to.equal(40);
        expect(summary.branch.miss).to.equal(40);
      });

      it('should use last given value', () => {
        builder.parse(`${InfoTypes.BranchFoundCount}:40`);
        builder.parse(`${InfoTypes.BranchFoundCount}:50`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.branch.total).to.equal(50);
        expect(summary.branch.miss).to.equal(50);
      });
    });

    describe('with Branch Hit Count', () => {
      it('should use default value when just identifier is passed', () => {
        builder.parse(`${InfoTypes.BranchHitCount}`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.branch.hit).to.equal(0);
        expect(summary.branch.miss).to.equal(0);
      });

      it('should use default value when no value is passed', () => {
        builder.parse(`${InfoTypes.BranchHitCount}:`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.branch.hit).to.equal(0);
        expect(summary.branch.miss).to.equal(0);
      });

      it('should use default value when invalid format is passed (NaN)', () => {
        builder.parse(`${InfoTypes.BranchHitCount}:astring`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.branch.hit).to.equal(0);
        expect(summary.branch.miss).to.equal(0);
      });

      it('should use given value when passed', () => {
        builder.parse(`${InfoTypes.BranchHitCount}:40`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.branch.hit).to.equal(40);
        expect(summary.branch.miss).to.equal(-40);
      });

      it('should use last given value', () => {
        builder.parse(`${InfoTypes.BranchHitCount}:40`);
        builder.parse(`${InfoTypes.BranchHitCount}:50`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(summary).to.be.an.instanceOf(summaryType);
        expect(summary.branch.hit).to.equal(50);
        expect(summary.branch.miss).to.equal(-50);
      });
    });
  });
}

describe('SummaryBuilder', () => {
  summaryBuilderTests(SummaryBuilder, Summary);
});
