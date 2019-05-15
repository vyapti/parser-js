import { assert, expect } from 'chai';

import FunctionDetail from '../../../../src/classes/details/functionDetail';

describe('FunctionDetail', () => {
  it('should construct properly', () => {
    const fd = new FunctionDetail(1, 2, 'test');
    expect(fd).to.be.an.instanceOf(FunctionDetail);
    expect(fd.lineNumber).to.equal(1);
    expect(fd.executionCount).to.equal(2);
    expect(fd.name).to.equal('test');
    assert.isDefined(fd.clone);
    assert.isDefined(fd.combine);
  });

  it('should clone properly', () => {
    const fd = new FunctionDetail(1, 2, 'test');
    const cloned = fd.clone();
    expect(cloned).to.be.an.instanceOf(FunctionDetail);
    expect(cloned.lineNumber).to.equal(fd.lineNumber);
    expect(cloned.executionCount).to.equal(fd.executionCount);
    expect(cloned.name).to.equal(fd.name);
    assert.notStrictEqual(cloned, fd);
    expect(cloned).to.deep.equal(fd);
  });

  it("should clone instead of combine when called with details that don't share the same line number and name", () => {
    const fd1 = new FunctionDetail(1, 2, 'test');
    const fd2 = new FunctionDetail(2, 2, 'test');
    const fd3 = new FunctionDetail(1, 2, 'test1');
    const fd4 = new FunctionDetail(2, 2, 'test1');
    const combined1 = fd1.combine(fd2);
    expect(combined1).to.be.an.instanceOf(FunctionDetail);
    expect(combined1).to.deep.equal(fd1);
    assert.notStrictEqual(combined1, fd1);
    const combined2 = fd1.combine(fd3);
    expect(combined2).to.be.an.instanceOf(FunctionDetail);
    expect(combined2).to.deep.equal(fd1);
    assert.notStrictEqual(combined2, fd1);
    const combined3 = fd1.combine(fd4);
    expect(combined3).to.be.an.instanceOf(FunctionDetail);
    expect(combined3).to.deep.equal(fd1);
    assert.notStrictEqual(combined3, fd1);
  });

  it('should combine when called with details that share the same line number and name', () => {
    const fd1 = new FunctionDetail(1, 2, 'test');
    const fd2 = new FunctionDetail(1, 3, 'test');
    const combined = fd1.combine(fd2);
    expect(combined).to.be.an.instanceOf(FunctionDetail);
    assert.notStrictEqual(combined, fd1);
    assert.notStrictEqual(combined, fd2);
    expect(combined.name)
      .to.equal(fd1.name)
      .and.to.equal(fd2.name);
    expect(combined.lineNumber)
      .to.equal(fd1.lineNumber)
      .and.to.equal(fd2.lineNumber);
    expect(combined.executionCount).to.equal(
      fd1.executionCount + fd2.executionCount,
    );
  });
});
