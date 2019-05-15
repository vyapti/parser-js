import { assert, expect } from 'chai';

import Detail from '../../../../src/classes/details/detail';

describe('Detail', () => {
  it('should construct properly', () => {
    const detail = new Detail(1, 2);
    expect(detail).to.be.an.instanceOf(Detail);
    expect(detail.lineNumber).to.equal(1);
    expect(detail.executionCount).to.equal(2);
    assert.isDefined(detail.clone);
    assert.isDefined(detail.combine);
  });

  it('should clone properly', () => {
    const detail = new Detail(1, 2);
    const cloned = detail.clone();
    expect(cloned.lineNumber).to.equal(detail.lineNumber);
    expect(cloned.executionCount).to.equal(detail.executionCount);
    expect(cloned).to.be.an.instanceOf(Detail);
    assert.notStrictEqual(cloned, detail);
  });

  it("should clone instead of combine when called with details that don't share the same line number", () => {
    const detail1 = new Detail(1, 2);
    const detail2 = new Detail(2, 3);
    const combined = detail1.combine(detail2);
    expect(combined).to.be.an.instanceOf(Detail);
    expect(combined.lineNumber).to.equal(detail1.lineNumber);
    expect(combined.executionCount).to.equal(detail1.executionCount);
    assert.notStrictEqual(combined, detail1);
    assert.notStrictEqual(combined, detail2);
  });

  it('should combine when called with details that share the same line number', () => {
    const detail1 = new Detail(1, 2);
    const detail2 = new Detail(1, 3);
    const combined = detail1.combine(detail2);
    expect(combined).to.be.an.instanceOf(Detail);
    expect(combined.lineNumber).to.equal(detail1.lineNumber);
    expect(combined.lineNumber).to.equal(detail2.lineNumber);
    expect(combined.executionCount).to.equal(
      detail1.executionCount + detail2.executionCount,
    );
    assert.notStrictEqual(combined, detail1);
    assert.notStrictEqual(combined, detail2);
  });
});
