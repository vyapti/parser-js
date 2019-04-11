import { assert, expect } from 'chai';
import 'mocha';

import Record from '../../../src/classes/records/record';
import Summary from '../../../src/classes/summaries/summary';

describe('Summary', () => {
  it('should construct properly', () => {
    const b = new Record(10, 4);
    const f = new Record(11, 5);
    const l = new Record(12, 6);
    const summary = new Summary('test/path', 'Test', b, f, l);
    expect(summary).to.be.an.instanceOf(Summary);
    expect(summary.path).to.equal('test/path');
    expect(summary.name).to.equal('Test');
    expect(summary.branch).to.deep.equal(b);
    expect(summary.function).to.deep.equal(f);
    expect(summary.line).to.deep.equal(l);
    assert.isDefined(summary.clone);
    assert.isDefined(summary.combine);
  });

  it('should clone properly', () => {
    const b = new Record(10, 4);
    const f = new Record(11, 5);
    const l = new Record(12, 6);
    const summary = new Summary('test/path', 'Test', b, f, l);
    const cloned = summary.clone();
    expect(cloned).to.be.an.instanceOf(Summary);
    expect(cloned.name).to.equal(summary.name);
    expect(cloned.path).to.equal(summary.path);
    expect(cloned.branch).to.deep.equal(summary.branch);
    expect(cloned.function).to.deep.equal(summary.function);
    expect(cloned.line).to.deep.equal(summary.line);
    expect(cloned).to.deep.equal(summary);
    assert.notStrictEqual(cloned, summary);
  });

  it('should clone instead combined when called with different name/path', () => {
    const b = new Record(10, 4);
    const f = new Record(11, 5);
    const l = new Record(12, 6);
    const summary1 = new Summary('test/path', 'Test', b, f, l);
    const summary2 = new Summary('test/path1', 'Test', b, f, l);
    const summary3 = new Summary('test/path', 'Test1', b, f, l);
    const summary4 = new Summary('test/path1', 'Test1', b, f, l);
    const combined1 = summary1.combine(summary2);
    expect(combined1).to.be.an.instanceOf(Summary);
    expect(combined1).to.deep.equal(summary1);
    const combined2 = summary1.combine(summary3);
    expect(combined2).to.be.an.instanceOf(Summary);
    expect(combined2).to.deep.equal(summary1);
    const combined3 = summary1.combine(summary4);
    expect(combined3).to.be.an.instanceOf(Summary);
    expect(combined3).to.deep.equal(summary1);
  });

  it('should combine properly when called with same name/path', () => {
    const b = new Record(10, 4);
    const f = new Record(11, 5);
    const l = new Record(12, 6);
    const summary1 = new Summary('test/path', 'Test', b, f, l);
    const summary2 = new Summary('test/path', 'Test', b, f, l);
    const combined = summary1.combine(summary2);
    const combinedFlipped = summary2.combine(summary1);
    expect(combined).to.be.an.instanceOf(Summary);
    expect(combinedFlipped).to.be.an.instanceOf(Summary);
    expect(combined.name).to.equal(summary1.name);
    expect(combined.path).to.equal(summary1.path);
    expect(combined).to.deep.equal(combinedFlipped);
  });
});
