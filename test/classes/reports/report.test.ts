import { assert, expect } from 'chai';
import 'mocha';

import Record from '../../../src/classes/records/record';
import Report from '../../../src/classes/reports/report';
import Summary from '../../../src/classes/summaries/summary';

describe('Report', () => {
  it('should construct properly', () => {
    const summary = new Summary(
      'path/test',
      'test',
      new Record(10, 4),
      new Record(11, 5),
      new Record(12, 6),
    );
    const root = new Summary(
      '/',
      'root',
      new Record(10, 4),
      new Record(11, 5),
      new Record(12, 6),
    );
    const paths = ['path/test'];
    const details = { 'path/test': summary };
    const report = new Report(root, paths, details);
    expect(report).to.be.an.instanceOf(Report);
    expect(report.paths).to.be.an.instanceOf(Array);
    expect(report.paths).to.deep.equal(paths);
    assert.notStrictEqual(report.paths, paths);
    expect(report.total).to.be.an.instanceOf(Summary);
    expect(report.total).to.deep.equal(root);
    assert.notStrictEqual(report.total, root);
    expect(report.details).to.have.property('path/test');
    expect(report.details).to.deep.equal(details);
    assert.notStrictEqual(report.details, details);
  });
});
