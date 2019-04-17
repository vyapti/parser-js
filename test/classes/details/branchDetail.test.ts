import { assert, expect } from 'chai';
import 'mocha';

import BranchDetail from '../../../src/classes/details/branchDetail';

describe('BranchDetail', () => {
  it('should construct properly', () => {
    const branchDetail = new BranchDetail(1, 2);
    expect(branchDetail).to.be.an.instanceOf(BranchDetail);
    expect(branchDetail.lineNumber).to.equal(1);
    expect(branchDetail.executionCount).to.equal(0);
    expect(branchDetail.blockNumber).to.deep.equal(2);
    assert.isEmpty(branchDetail.branches);
    assert.isDefined(branchDetail.clone);
    assert.isDefined(branchDetail.combine);
  });

  describe('addBranchExecutionCount', () => {
    it('should update total execution count', () => {
      const branchDetail = new BranchDetail(1, 1);
      expect(branchDetail.executionCount).to.equal(0);
      branchDetail.addBranchExecutionCount(1, 1);
      expect(branchDetail.executionCount).to.equal(1);
    });

    it("should add an entry in branches map if it doesn't exist", () => {
      const branchDetail = new BranchDetail(1, 1);
      branchDetail.addBranchExecutionCount(1, 2);
      expect(branchDetail.branches[1]).to.equal(2);
      branchDetail.addBranchExecutionCount(2, 2);
      expect(branchDetail.branches[1]).to.equal(2);
      expect(branchDetail.branches[2]).to.equal(2);
    });

    it('should update an entry in branches map if it does exist', () => {
      const branchDetail = new BranchDetail(1, 1);
      branchDetail.addBranchExecutionCount(1, 2);
      expect(branchDetail.branches[1]).to.equal(2);
      branchDetail.addBranchExecutionCount(1, 3);
      expect(branchDetail.branches[1]).to.equal(5);
    });

    it('should throw error if branch number is invalid', () => {
      const branchDetail = new BranchDetail(1, 1);
      expect(() => branchDetail.addBranchExecutionCount(-1, 0)).to.throw(
        /Illegal Argument/,
      );
    });

    it('should thorw error if execution count is invalid', () => {
      const branchDetail = new BranchDetail(1, 1);
      expect(() => branchDetail.addBranchExecutionCount(0, -1)).to.throw(
        /Illegal Argument/,
      );
    });
  });

  describe('getBranchExecutionCount', () => {
    it('should return 0 if branch data does not exist', () => {
      const branchDetail = new BranchDetail(1, 1);
      expect(branchDetail.getBranchExecutionCount(1)).to.equal(0);
    });

    it('should return correct value if branch data does not exist', () => {
      const branchDetail = new BranchDetail(1, 1);
      expect(branchDetail.getBranchExecutionCount(1)).to.equal(0);
      branchDetail.addBranchExecutionCount(1, 2);
      expect(branchDetail.getBranchExecutionCount(1)).to.equal(2);
    });
  });

  it('should clone properly', () => {
    const bd = new BranchDetail(1, 1);
    bd.addBranchExecutionCount(0, 1);
    bd.addBranchExecutionCount(1, 2);
    const cloned = bd.clone();
    expect(cloned).to.be.an.instanceOf(BranchDetail);
    expect(cloned.lineNumber).to.equal(bd.lineNumber);
    expect(cloned.blockNumber).to.equal(bd.blockNumber);
    expect(cloned.branches).to.deep.equal(bd.branches);
    expect(cloned.executionCount).to.equal(bd.executionCount);
    assert.notStrictEqual(cloned, bd);
    expect(cloned).to.deep.equal(bd);
  });

  it("should clone instead of combine when called with branch detail that doesn't share line and block number", () => {
    const bd1 = new BranchDetail(1, 1);
    const bd2 = new BranchDetail(1, 2);
    const bd3 = new BranchDetail(2, 1);
    const bd4 = new BranchDetail(2, 2);
    const combined1 = bd1.combine(bd2);
    expect(combined1).to.be.an.instanceOf(BranchDetail);
    expect(combined1.lineNumber).to.equal(bd1.lineNumber);
    expect(combined1.blockNumber).to.equal(bd1.blockNumber);
    expect(combined1.branches).to.deep.equal(bd1.branches);
    expect(combined1.executionCount).to.equal(bd1.executionCount);
    const combined2 = bd1.combine(bd3);
    expect(combined2).to.be.an.instanceOf(BranchDetail);
    expect(combined2.lineNumber).to.equal(bd1.lineNumber);
    expect(combined2.blockNumber).to.equal(bd1.blockNumber);
    expect(combined2.branches).to.deep.equal(bd1.branches);
    expect(combined2.executionCount).to.equal(bd1.executionCount);
    const combined3 = bd1.combine(bd4);
    expect(combined3).to.be.an.instanceOf(BranchDetail);
    expect(combined3.lineNumber).to.equal(bd1.lineNumber);
    expect(combined3.blockNumber).to.equal(bd1.blockNumber);
    expect(combined3.branches).to.deep.equal(bd1.branches);
    expect(combined3.executionCount).to.equal(bd1.executionCount);
  });

  it('should combine when called with branch detail that shares the same line and block numbers', () => {
    const bd1 = new BranchDetail(1, 1);
    bd1.addBranchExecutionCount(0, 1);
    bd1.addBranchExecutionCount(1, 1);
    const bd2 = new BranchDetail(1, 1);
    bd2.addBranchExecutionCount(1, 1);
    bd2.addBranchExecutionCount(2, 1);
    const combined = bd1.combine(bd2);
    expect(combined).to.be.an.instanceOf(BranchDetail);
    expect(combined.lineNumber)
      .to.equal(bd1.lineNumber)
      .and.to.equal(bd2.lineNumber);
    expect(combined.blockNumber)
      .to.equal(bd1.blockNumber)
      .and.to.equal(bd2.blockNumber);
    expect(combined.executionCount).to.equal(
      bd1.executionCount + bd2.executionCount,
    );
    expect(combined.branches).to.deep.equal({ 0: 1, 1: 2, 2: 1 });
  });
});
