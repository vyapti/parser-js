import { assert, expect } from 'chai';
import 'mocha';

import Record from '../../../src/classes/records/record';

describe('Record', () => {
  describe('should contruct properly', () => {
    it('without miss parameter', () => {
      const record = new Record(10, 4);
      expect(record).to.be.an.instanceOf(Record);
      expect(record.total).to.equal(10);
      expect(record.hit).to.equal(4);
      expect(record.miss).to.equal(6);
      assert.isDefined(record.clone);
      assert.isDefined(record.combine);
    });

    it('with miss parameter', () => {
      const record = new Record(10, 4, 5);
      expect(record).to.be.an.instanceOf(Record);
      expect(record.total).to.equal(10);
      expect(record.hit).to.equal(4);
      expect(record.miss).to.equal(5);
      assert.isDefined(record.clone);
      assert.isDefined(record.combine);
    });
  });

  it('should clone properly', () => {
    const r = new Record(10, 9, 8);
    const cloned = r.clone();
    expect(cloned).to.be.an.instanceOf(Record);
    expect(cloned.hit).to.equal(r.hit);
    expect(cloned.total).to.equal(r.total);
    expect(cloned.miss).to.equal(r.miss);
    expect(cloned).to.deep.equal(r);
  });

  it('should combine properly', () => {
    const r1 = new Record(10, 6, 4);
    const r2 = new Record(10, 6);
    const combined1 = r1.combine(r2);
    const combined2 = r2.combine(r1);
    expect(combined1).to.deep.equal(combined2);
    expect(combined1).to.be.an.instanceOf(Record);
    expect(combined1.total).to.equal(r1.total + r2.total);
    expect(combined1.hit).to.equal(r1.hit + r2.hit);
    expect(combined1.miss).to.equal(r1.miss + r2.miss);
  });
});
