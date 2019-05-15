import { assert, expect } from 'chai';

import Detail from '../../../../src/classes/details/detail';
import DetailedRecord from '../../../../src/classes/records/detailedRecord';

describe('DetailedRecord', () => {
  describe('should contruct properly', () => {
    it('when neither miss nor initialDetails are specified', () => {
      const dr = new DetailedRecord(10, 4);
      expect(dr).to.be.an.instanceOf(DetailedRecord);
      expect(dr.total).to.equal(10);
      expect(dr.hit).to.equal(4);
      expect(dr.miss).to.equal(6);
      expect(dr.details).to.deep.equal({});
      assert.isDefined(dr.addDetail);
      assert.isDefined(dr.clone);
      assert.isDefined(dr.combine);
    });

    it('when initialDetails is not specified', () => {
      const dr = new DetailedRecord(10, 4, 5);
      expect(dr).to.be.an.instanceOf(DetailedRecord);
      expect(dr.total).to.equal(10);
      expect(dr.hit).to.equal(4);
      expect(dr.miss).to.equal(5);
      expect(dr.details).to.deep.equal({});
      assert.isDefined(dr.addDetail);
      assert.isDefined(dr.clone);
      assert.isDefined(dr.combine);
    });

    it('when miss and initialDetails are specified', () => {
      const d = new Detail(1, 1);
      const initialDetails = { 1: d };
      const dr = new DetailedRecord(10, 4, 5, initialDetails);
      expect(dr).to.be.an.instanceOf(DetailedRecord);
      expect(dr.total).to.equal(10);
      expect(dr.hit).to.equal(4);
      expect(dr.miss).to.equal(5);
      expect(dr.details).to.deep.equal(initialDetails);
      assert.isDefined(dr.addDetail);
      assert.isDefined(dr.clone);
      assert.isDefined(dr.combine);
      assert.notStrictEqual(dr.details, initialDetails);
    });
  });

  describe('addDetail', () => {
    it('should add new detail if not previously added to detail map', () => {
      const dr = new DetailedRecord(10, 4);
      const d1 = new Detail(1, 1);
      const d2 = new Detail(2, 1);
      expect(dr.details).to.deep.equal({});
      dr.addDetail(d1);
      expect(dr.details[1]).to.deep.equal(d1);
      dr.addDetail(d2);
      expect(dr.details[2]).to.deep.equal(d2);
    });

    it('should combine with existing detail if detail previously existed', () => {
      const dr = new DetailedRecord(10, 4);
      const d1 = new Detail(1, 1);
      const d2 = new Detail(1, 2);
      dr.addDetail(d1);
      expect(dr.details[1]).to.deep.equal(d1);
      dr.addDetail(d2);
      expect(dr.details[1])
        .not.to.deep.equal(d1)
        .and.not.to.equal(d2);
      expect(dr.details[1].lineNumber).to.equal(1);
      expect(dr.details[1].executionCount).to.equal(3);
    });
  });

  it('should clone properly', () => {
    const dr = new DetailedRecord(10, 4, 5, { 1: new Detail(1, 4) });
    const cloned = dr.clone();
    expect(cloned).to.be.an.instanceOf(DetailedRecord);
    expect(cloned.total).to.equal(dr.total);
    expect(cloned.hit).to.equal(dr.hit);
    expect(cloned.miss).to.equal(dr.miss);
    expect(cloned.details).to.deep.equal(dr.details);
    expect(cloned).to.deep.equal(dr);
    assert.notStrictEqual(cloned, dr);
  });

  it('should combine properly', () => {
    const dr1 = new DetailedRecord(10, 4, 6, {
      1: new Detail(1, 4),
      2: new Detail(2, 5),
    });
    const dr2 = new DetailedRecord(10, 3, 7, {
      2: new Detail(2, 3),
      3: new Detail(3, 3),
    });
    const combined1 = dr1.combine(dr2);
    const combined2 = dr2.combine(dr1);
    expect(combined1).to.be.an.instanceOf(DetailedRecord);
    expect(combined2).to.be.an.instanceOf(DetailedRecord);
    expect(combined1).to.deep.equal(combined2);
    expect(combined1.total).to.equal(dr1.total + dr2.total);
    expect(combined1.hit).to.equal(dr1.hit + dr2.hit);
    expect(combined1.miss).to.equal(dr1.miss + dr2.miss);
    expect(combined1.details[1]).to.deep.equal(dr1.details[1]);
    expect(combined1.details[3]).to.deep.equal(dr2.details[3]);
    expect(combined1.details[2]).to.deep.equal(new Detail(2, 8));
  });
});
