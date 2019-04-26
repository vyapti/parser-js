import { expect } from 'chai';

import DetailedSummaryBuilder from '../../../../src/classes/builders/detailedSummaryBuilder';
import BranchDetail from '../../../../src/classes/details/branchDetail';
import Detail from '../../../../src/classes/details/detail';
import FunctionDetail from '../../../../src/classes/details/functionDetail';
import DetailedSummary from '../../../../src/classes/summaries/detailedSummary';
import { InfoTypes } from '../../../../src/utils/index';

import { summaryBuilderTests } from './summaryBuilder.test';

describe('DetailedSummaryBuilder', () => {
  describe('conforming to SummaryBuilder Spec', () => {
    summaryBuilderTests(DetailedSummaryBuilder, DetailedSummary);
  });

  describe('parse', () => {
    let builder: DetailedSummaryBuilder;

    beforeEach(() => {
      builder = new DetailedSummaryBuilder();
    });

    describe('with Function Name Input', () => {
      it('should use default value when just type identifier is passed', () => {
        builder.parse(`${InfoTypes.FunctionName}`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(Object.keys(summary.function.details)).to.have.lengthOf(0);
      });

      it('should use default value when no values are passed', () => {
        builder.parse(`${InfoTypes.FunctionName}:`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(Object.keys(summary.function.details)).to.have.lengthOf(0);
      });

      it('should use default value when invalid formats are passed', () => {
        builder.parse(`${InfoTypes.FunctionName}:string,12`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(Object.keys(summary.function.details)).to.have.lengthOf(0);
      });

      it('should add new entry with name and line only', () => {
        builder.parse(`${InfoTypes.FunctionName}:12,test`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(Object.keys(summary.function.details)).to.have.lengthOf(1);
        expect(summary.function.details[12]).to.be.an.instanceOf(
          FunctionDetail,
        );
        const detail = summary.function.details[12] as FunctionDetail;
        expect(detail.name).to.equal('test');
        expect(detail.lineNumber).to.equal(12);
        expect(detail.executionCount).to.equal(0);
      });

      it('should add data to existing entry if previously tracked', () => {
        builder.parse(`${InfoTypes.FunctionNameCovered}:14,test`);
        builder.parse(`${InfoTypes.FunctionName}:12,test`);
        builder.parse(`${InfoTypes.FunctionName}:13,test`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(Object.keys(summary.function.details)).to.have.lengthOf(1);
        expect(summary.function.details[13]).to.be.an.instanceOf(
          FunctionDetail,
        );
        const detail = summary.function.details[13] as FunctionDetail;
        expect(detail.name).to.equal('test');
        expect(detail.lineNumber).to.equal(13);
        expect(detail.executionCount).to.equal(14);
      });
    });

    describe('with Function Name Covered Input', () => {
      it('should use default value when just type identifier is passed', () => {
        builder.parse(`${InfoTypes.FunctionNameCovered}`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(Object.keys(summary.function.details)).to.have.lengthOf(0);
      });

      it('should use default value when no values are passed', () => {
        builder.parse(`${InfoTypes.FunctionNameCovered}:`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(Object.keys(summary.function.details)).to.have.lengthOf(0);
      });

      it('should use default value when invalid formats are passed', () => {
        builder.parse(`${InfoTypes.FunctionNameCovered}:string,12`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(Object.keys(summary.function.details)).to.have.lengthOf(0);
      });

      it('should add new entry with name and exec count only', () => {
        builder.parse(`${InfoTypes.FunctionNameCovered}:12,testname`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(Object.keys(summary.function.details)).to.have.lengthOf(1);
        expect(summary.function.details[-1]).to.be.an.instanceOf(
          FunctionDetail,
        );
        const detail = summary.function.details[-1] as FunctionDetail;
        expect(detail.lineNumber).to.equal(-1);
        expect(detail.executionCount).to.equal(12);
        expect(detail.name).to.equal('testname');
      });

      it('should add data to existing entry if previously tracked', () => {
        builder.parse(`${InfoTypes.FunctionName}:4,testname`);
        builder.parse(`${InfoTypes.FunctionNameCovered}:14,testname`);
        builder.parse(`${InfoTypes.FunctionNameCovered}:12,testname`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(Object.keys(summary.function.details)).to.have.lengthOf(1);
        expect(summary.function.details[4]).to.be.an.instanceOf(FunctionDetail);
        const detail = summary.function.details[4] as FunctionDetail;
        expect(detail.lineNumber).to.equal(4);
        expect(detail.executionCount).to.equal(12);
        expect(detail.name).to.equal('testname');
      });
    });

    describe('with Covered Line Input', () => {
      it('should use default value when just type identifier is passed', () => {
        builder.parse(`${InfoTypes.CoveredLine}`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(Object.keys(summary.line.details)).to.have.lengthOf(0);
      });

      it('should use default value when no values are passed', () => {
        builder.parse(`${InfoTypes.CoveredLine}:`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(Object.keys(summary.line.details)).to.have.lengthOf(0);
      });

      it('should use default value when invalid formats are passed', () => {
        builder.parse(`${InfoTypes.CoveredLine}:string`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(Object.keys(summary.line.details)).to.have.lengthOf(0);
      });

      it('should use given values when passed', () => {
        builder.parse(`${InfoTypes.CoveredLine}:2,2`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(Object.keys(summary.line.details)).to.have.lengthOf(1);
        expect(summary.line.details[2]).to.be.an.instanceOf(Detail);
        const detail = summary.line.details[2];
        expect(detail.lineNumber).to.equal(2);
        expect(detail.executionCount).to.equal(2);
      });

      it('should use last value passed', () => {
        builder.parse(`${InfoTypes.CoveredLine}:1,2`);
        builder.parse(`${InfoTypes.CoveredLine}:2,3`);
        builder.parse(`${InfoTypes.CoveredLine}:2,4`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(Object.keys(summary.line.details)).to.have.lengthOf(2);
        expect(summary.line.details[1]).to.be.an.instanceOf(Detail);
        expect(summary.line.details[2]).to.be.an.instanceOf(Detail);
        const detail1 = summary.line.details[1];
        const detail2 = summary.line.details[2];
        expect(detail1.lineNumber).to.equal(1);
        expect(detail1.executionCount).to.equal(2);
        expect(detail2.lineNumber).to.equal(2);
        expect(detail2.executionCount).to.equal(4);
      });
    });

    describe('with Branch Covered Input', () => {
      it('should use default value when just type identifier is passed', () => {
        builder.parse(`${InfoTypes.BranchCovered}`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(Object.keys(summary.branch.details)).to.have.lengthOf(0);
      });

      it('should use default value when no values are passed', () => {
        builder.parse(`${InfoTypes.BranchCovered}:`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(Object.keys(summary.branch.details)).to.have.lengthOf(0);
      });

      it('should use default value when invalid formats are passed', () => {
        const testNanInput = (data: string) => {
          builder = new DetailedSummaryBuilder();
          builder.parse(`${InfoTypes.BranchCovered}:${data}`);
          builder.parse(`${InfoTypes.EndSection}`);
          const summary = builder.build();
          expect(Object.keys(summary.branch.details)).to.have.lengthOf(0);
        };

        testNanInput('string,1,1,1');
        testNanInput('1,string,1,1');
        testNanInput('1,1,string,1');
        testNanInput('1,1,1,string');
      });

      it('should use given values when passed', () => {
        builder.parse(`${InfoTypes.BranchCovered}:1,2,0,4`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(Object.keys(summary.branch.details)).to.have.lengthOf(1);
        expect(summary.branch.details[1]).to.have.instanceof(BranchDetail);
        const bd = summary.branch.details[1] as BranchDetail;
        expect(bd.lineNumber).to.equal(1);
        expect(bd.executionCount).to.equal(4);
        expect(bd.blockNumber).to.equal(2);
        expect(bd.branches[0]).to.equal(4);
      });

      it('should add branch data together', () => {
        builder.parse(`${InfoTypes.BranchCovered}:1,2,0,4`);
        builder.parse(`${InfoTypes.BranchCovered}:1,2,1,3`);
        builder.parse(`${InfoTypes.EndSection}`);
        const summary = builder.build();
        expect(Object.keys(summary.branch.details)).to.have.lengthOf(1);
        expect(summary.branch.details[1]).to.have.instanceof(BranchDetail);
        const bd = summary.branch.details[1] as BranchDetail;
        expect(bd.lineNumber).to.equal(1);
        expect(bd.executionCount).to.equal(7);
        expect(bd.blockNumber).to.equal(2);
        expect(bd.branches[0]).to.equal(4);
        expect(bd.branches[1]).to.equal(3);
      });
    });
  });
});
