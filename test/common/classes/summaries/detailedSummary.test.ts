import { assert, expect } from 'chai';

import DetailedRecord from '../../../../src/classes/records/detailedRecord';
import DetailedSummary from '../../../../src/classes/summaries/detailedSummary';

describe('DetailedSummary', () => {
  it('should construct properly', () => {
    const b = new DetailedRecord(10, 4);
    const f = new DetailedRecord(10, 5);
    const l = new DetailedRecord(10, 6);
    const ds = new DetailedSummary('test/path', 'test', b, f, l);
    expect(ds).to.be.an.instanceOf(DetailedSummary);
    expect(ds.name).to.equal('test');
    expect(ds.path).to.equal('test/path');
    expect(ds.branch).to.be.ok.and.to.be.an.instanceOf(DetailedRecord);
    expect(ds.function).to.be.ok.and.to.be.an.instanceOf(DetailedRecord);
    expect(ds.line).to.be.ok.and.to.be.an.instanceOf(DetailedRecord);
    assert.isDefined(ds.clone);
    assert.isDefined(ds.combine);
  });

  it('should clone properly', () => {
    const ds = new DetailedSummary(
      'test/path',
      'test',
      new DetailedRecord(10, 4),
      new DetailedRecord(11, 5),
      new DetailedRecord(12, 6),
    );
    const cloned = ds.clone();
    expect(cloned).to.be.an.instanceOf(DetailedSummary);
    expect(cloned.name).to.equal(ds.name);
    expect(cloned.path).to.equal(ds.path);
    expect(cloned.branch).to.be.an.instanceOf(DetailedRecord);
    expect(cloned.branch).to.deep.equal(ds.branch);
    expect(cloned.function).to.be.an.instanceOf(DetailedRecord);
    expect(cloned.function).to.deep.equal(ds.function);
    expect(cloned.line).to.be.an.instanceOf(DetailedRecord);
    expect(cloned.line).to.deep.equal(ds.line);
    assert.notStrictEqual(cloned, ds);
  });

  it('should clone instead of combine when called with different name/path', () => {
    const b = new DetailedRecord(10, 4);
    const f = new DetailedRecord(11, 5);
    const l = new DetailedRecord(12, 6);
    const summary1 = new DetailedSummary('test/path', 'Test', b, f, l);
    const summary2 = new DetailedSummary('test/path1', 'Test', b, f, l);
    const summary3 = new DetailedSummary('test/path', 'Test1', b, f, l);
    const summary4 = new DetailedSummary('test/path1', 'Test1', b, f, l);
    const combined1 = summary1.combine(summary2);
    expect(combined1).to.be.an.instanceOf(DetailedSummary);
    expect(combined1).to.deep.equal(summary1);
    const combined2 = summary1.combine(summary3);
    expect(combined2).to.be.an.instanceOf(DetailedSummary);
    expect(combined2).to.deep.equal(summary1);
    const combined3 = summary1.combine(summary4);
    expect(combined3).to.be.an.instanceOf(DetailedSummary);
    expect(combined3).to.deep.equal(summary1);
  });

  it('should combine properly when called with same name/path', () => {
    const b = new DetailedRecord(10, 4);
    const f = new DetailedRecord(11, 5);
    const l = new DetailedRecord(12, 6);
    const summary1 = new DetailedSummary('test/path', 'Test', b, f, l);
    const summary2 = new DetailedSummary('test/path', 'Test', b, f, l);
    const combined = summary1.combine(summary2);
    const combinedFlipped = summary2.combine(summary1);
    expect(combined).to.be.an.instanceOf(DetailedSummary);
    expect(combinedFlipped).to.be.an.instanceOf(DetailedSummary);
    expect(combined.name).to.equal(summary1.name);
    expect(combined.path).to.equal(summary1.path);
    expect(combined.branch).to.be.an.instanceOf(DetailedRecord);
    expect(combined.function).to.be.an.instanceOf(DetailedRecord);
    expect(combined.line).to.be.an.instanceOf(DetailedRecord);
    expect(combined).to.deep.equal(combinedFlipped);
  });
});
