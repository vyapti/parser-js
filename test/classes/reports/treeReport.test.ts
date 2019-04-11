import { assert, expect } from 'chai';
import 'mocha';

import DetailedRecord from '../../../src/classes/records/detailedRecord';
import Record from '../../../src/classes/records/record';
import TreeReport from '../../../src/classes/reports/treeReport';
import TreeReportNode from '../../../src/classes/reports/treeReportNode';
import DetailedSummary from '../../../src/classes/summaries/detailedSummary';
import Summary from '../../../src/classes/summaries/summary';

describe('TreeReport', () => {
  it('should construct properly', () => {
    const b = new Record(10, 4);
    const f = new Record(11, 5);
    const l = new Record(12, 6);
    const childPaths = ['test/path/child', 'test/path/child1'];
    const summary1 = new DetailedSummary(
      'test/path/child',
      'test',
      new DetailedRecord(1, 1),
      new DetailedRecord(1, 1),
      new DetailedRecord(1, 1),
    );
    const childNode1 = new TreeReportNode('test/path/child1', 'test', b, f, l);
    const children = {
      'test/path/child': summary1,
      'test/path/child1': childNode1,
    };
    const node = new TreeReportNode(
      'test/path',
      'test',
      b,
      f,
      l,
      childPaths,
      children,
    );
    const summary = new DetailedSummary(
      'test/path1',
      'test',
      new DetailedRecord(1, 1),
      new DetailedRecord(1, 1),
      new DetailedRecord(1, 1),
    );
    const details = {
      'test/path': node,
      'test/path1': summary,
    };
    const paths = ['test/path', 'test/path1'];
    const root = new Summary(
      '/',
      'root',
      new Record(1, 1),
      new Record(1, 1),
      new Record(1, 1),
    );
    const report = new TreeReport(root, paths, details);
    expect(report).to.be.an.instanceOf(TreeReport);
    expect(report.paths).to.be.an.instanceOf(Array);
    expect(report.paths).to.deep.equal(paths);
    assert.notStrictEqual(report.paths, paths);
    expect(report.total).to.be.an.instanceOf(Summary);
    expect(report.total).to.deep.equal(root);
    assert.notStrictEqual(report.total, root);
    expect(report.details).to.have.property('test/path');
    expect(report.details).to.have.property('test/path1');
    expect(report.details).to.deep.equal(details);
    assert.notStrictEqual(report.details, details);
  });
});
