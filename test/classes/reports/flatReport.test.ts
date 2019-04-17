import { assert, expect } from 'chai';
import 'mocha';

import Detail from '../../../src/classes/details/detail';
import DetailedRecord from '../../../src/classes/records/detailedRecord';
import FlatReport from '../../../src/classes/reports/flatReport';
import DetailedSummary from '../../../src/classes/summaries/detailedSummary';

describe('FlatReport', () => {
  it('should construct properly', () => {
    const detail = new Detail(1, 4);
    const detailedRecord = new DetailedRecord(10, 4, 6, { 1: detail });
    const summary = new DetailedSummary(
      'path/test',
      'test',
      detailedRecord,
      detailedRecord,
      detailedRecord,
    );
    const root = new DetailedSummary(
      '/',
      'root',
      detailedRecord,
      detailedRecord,
      detailedRecord,
    );
    const paths = ['path/test'];
    const details = { 'path/test': summary };
    const report = new FlatReport(root, paths, details);
    expect(report).to.be.an.instanceOf(FlatReport);
    expect(report.paths).to.be.an.instanceOf(Array);
    expect(report.paths).to.deep.equal(paths);
    assert.notStrictEqual(report.paths, paths);
    expect(report.total).to.be.an.instanceOf(DetailedSummary);
    expect(report.total).to.deep.equal(root);
    assert.notStrictEqual(report.total, root);
    expect(report.details).to.have.property('path/test');
    expect(report.details).to.deep.equal(details);
    assert.notStrictEqual(report.details, details);
  });
});
