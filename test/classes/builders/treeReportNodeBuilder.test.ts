import { assert, expect } from 'chai';
import 'mocha';

import TreeReportNodeBuilder from '../../../src/classes/builders/treeReportNodeBuilder';
import DetailedRecord from '../../../src/classes/records/detailedRecord';
import Record from '../../../src/classes/records/record';
import TreeReportNode from '../../../src/classes/reports/treeReportNode';
import DetailedSummary from '../../../src/classes/summaries/detailedSummary';

describe('TreeReportNodeBuilder', () => {
  it('should construct with no root path', () => {
    const builder = new TreeReportNodeBuilder();
    expect(builder).to.be.an.instanceOf(TreeReportNodeBuilder);
    assert.isDefined(builder.build);
    assert.isDefined(builder.addChildNode);
    assert.isDefined(builder.addChildSummary);
  });

  it('should construct with root path', () => {
    const builder = new TreeReportNodeBuilder('/test/path');
    expect(builder).to.be.an.instanceOf(TreeReportNodeBuilder);
    assert.isDefined(builder.build);
    assert.isDefined(builder.addChildNode);
    assert.isDefined(builder.addChildSummary);
  });

  describe('build', () => {
    let builder: TreeReportNodeBuilder;

    beforeEach(() => {
      builder = new TreeReportNodeBuilder();
    });

    it('should be unable to build before any children are added', () => {
      expect(() => {
        builder.build();
      }).to.throw('Unable to build');
    });

    it('should be able to build after a child summary is added', () => {
      const child = new DetailedSummary(
        'test',
        'test',
        new DetailedRecord(10, 4),
        new DetailedRecord(11, 3),
        new DetailedRecord(12, 2),
      );
      builder.addChildSummary(child);
      const node = builder.build();
      expect(node).to.be.an.instanceOf(TreeReportNode);
      expect(node.path).to.equal('');
      expect(node.name).to.equal('');
      expect(node.childPaths).to.have.lengthOf(1);
      expect(node.childPaths).to.include('test');
      expect(node.children).to.have.property('test');
      expect(node.children.test).to.be.an.instanceOf(DetailedSummary);
    });

    it('should be able to build after a child node is added', () => {
      const summary = new DetailedSummary(
        'test1',
        'test1',
        new DetailedRecord(10, 4),
        new DetailedRecord(11, 3),
        new DetailedRecord(12, 2),
      );
      const child = new TreeReportNode(
        'test',
        'test',
        new Record(10, 4),
        new Record(11, 3),
        new Record(12, 2),
        ['test1'],
        { test1: summary },
      );

      builder.addChildNode(child);
      const node = builder.build();
      expect(node).to.be.an.instanceOf(TreeReportNode);
      expect(node.path).to.equal('');
      expect(node.name).to.equal('');
      expect(node.childPaths).to.have.lengthOf(1);
      expect(node.childPaths).to.contain('test1');
      expect(Object.keys(node.children)).to.have.lengthOf(1);
      expect(node.children).to.have.property('test');
      expect(node.children.test).to.be.an.instanceOf(TreeReportNode);
      const childNode = node.children.test as TreeReportNode;
      expect(childNode).to.deep.equal(child);
    });
  });

  describe('addChildSummary', () => {
    let builder: TreeReportNodeBuilder;

    beforeEach(() => {
      builder = new TreeReportNodeBuilder();
    });

    it('should combine two summaries that share the same path', () => {
      const child1 = new DetailedSummary(
        'test',
        'test',
        new DetailedRecord(8, 4),
        new DetailedRecord(9, 3),
        new DetailedRecord(10, 2),
      );
      const child2 = new DetailedSummary(
        'test',
        'test',
        new DetailedRecord(10, 4),
        new DetailedRecord(11, 3),
        new DetailedRecord(12, 2),
      );

      builder.addChildSummary(child1);
      builder.addChildSummary(child2);

      const node = builder.build();

      expect(node).to.be.an.instanceOf(TreeReportNode);
      expect(node.path).to.equal('');
      expect(node.name).to.equal('');
      expect(node.childPaths).to.have.lengthOf(1);
      expect(node.childPaths).to.contain('test');
      expect(Object.keys(node.children)).to.have.lengthOf(1);
      expect(node.children).to.have.property('test');
      expect(node.children.test).to.be.an.instanceOf(DetailedSummary);
      const childNode = node.children.test as DetailedSummary;
      const combined = child1.combine(child2);
      expect(childNode).to.deep.equal(combined);
      expect(node.branch.total).to.deep.equal(combined.branch.total);
      expect(node.branch.hit).to.deep.equal(combined.branch.hit);
      expect(node.branch.miss).to.deep.equal(combined.branch.miss);
      expect(node.function.total).to.deep.equal(combined.function.total);
      expect(node.function.hit).to.deep.equal(combined.function.hit);
      expect(node.function.miss).to.deep.equal(combined.function.miss);
      expect(node.line.total).to.deep.equal(combined.line.total);
      expect(node.line.hit).to.deep.equal(combined.line.hit);
      expect(node.line.miss).to.deep.equal(combined.line.miss);
    });

    it('should throw an error if attempting to add a summary with the same path as an existing node', () => {
      const summary = new DetailedSummary(
        'test1',
        'test1',
        new DetailedRecord(10, 4),
        new DetailedRecord(11, 3),
        new DetailedRecord(12, 2),
      );
      const childNode = new TreeReportNode(
        'test',
        'test',
        new Record(10, 4),
        new Record(11, 3),
        new Record(12, 2),
        ['test1'],
        { test1: summary },
      );
      const childSummary = new DetailedSummary(
        'test',
        'test',
        new DetailedRecord(10, 4),
        new DetailedRecord(11, 3),
        new DetailedRecord(12, 2),
      );

      builder.addChildNode(childNode);
      expect(() => {
        builder.addChildSummary(childSummary);
      }).to.throw();
    });
  });

  describe('addChildNode', () => {
    let builder: TreeReportNodeBuilder;

    beforeEach(() => {
      builder = new TreeReportNodeBuilder();
    });

    it('should combine two nodes with the same path', () => {
      const summary1 = new DetailedSummary(
        'test1',
        'test1',
        new DetailedRecord(10, 4),
        new DetailedRecord(11, 3),
        new DetailedRecord(12, 2),
      );
      const summary2 = new DetailedSummary(
        'test2',
        'test2',
        new DetailedRecord(10, 4),
        new DetailedRecord(11, 3),
        new DetailedRecord(12, 2),
      );
      const childNode1 = new TreeReportNode(
        'test',
        'test',
        new Record(10, 4),
        new Record(11, 3),
        new Record(12, 2),
        ['test1'],
        { test1: summary1 },
      );
      const childNode2 = new TreeReportNode(
        'test',
        'test',
        new Record(10, 4),
        new Record(11, 3),
        new Record(12, 2),
        ['test2'],
        { test2: summary2 },
      );

      builder.addChildNode(childNode1);
      builder.addChildNode(childNode2);

      const node = builder.build();

      expect(node).to.be.an.instanceOf(TreeReportNode);
      expect(node.path).to.equal('');
      expect(node.name).to.equal('');
      expect(node.childPaths).to.have.lengthOf(2);
      expect(node.childPaths).to.contain('test1');
      expect(node.childPaths).to.contain('test2');
      expect(Object.keys(node.children)).to.have.lengthOf(1);
      expect(node.children).to.have.property('test');
      expect(node.children.test).to.be.an.instanceOf(TreeReportNode);
      const childNode = node.children.test as TreeReportNode;
      expect(childNode.childPaths).to.have.lengthOf(2);
      expect(childNode.childPaths).to.contain('test1');
      expect(childNode.childPaths).to.contain('test2');

      expect(node.branch.total).to.deep.equal(
        summary1.branch.total + summary2.branch.total,
      );
      expect(node.branch.hit).to.deep.equal(
        summary1.branch.hit + summary2.branch.hit,
      );
      expect(node.branch.miss).to.deep.equal(
        summary1.branch.miss + summary2.branch.miss,
      );
      expect(node.function.total).to.deep.equal(
        summary1.function.total + summary2.function.total,
      );
      expect(node.function.hit).to.deep.equal(
        summary1.function.hit + summary2.function.hit,
      );
      expect(node.function.miss).to.deep.equal(
        summary1.function.miss + summary2.function.miss,
      );
      expect(node.line.total).to.deep.equal(
        summary1.line.total + summary2.line.total,
      );
      expect(node.line.hit).to.deep.equal(
        summary1.line.hit + summary2.line.hit,
      );
      expect(node.line.miss).to.deep.equal(
        summary1.line.miss + summary2.line.miss,
      );

      expect(childNode.branch.total).to.deep.equal(
        summary1.branch.total + summary2.branch.total,
      );
      expect(childNode.branch.hit).to.deep.equal(
        summary1.branch.hit + summary2.branch.hit,
      );
      expect(childNode.branch.miss).to.deep.equal(
        summary1.branch.miss + summary2.branch.miss,
      );
      expect(childNode.function.total).to.deep.equal(
        summary1.function.total + summary2.function.total,
      );
      expect(childNode.function.hit).to.deep.equal(
        summary1.function.hit + summary2.function.hit,
      );
      expect(childNode.function.miss).to.deep.equal(
        summary1.function.miss + summary2.function.miss,
      );
      expect(childNode.line.total).to.deep.equal(
        summary1.line.total + summary2.line.total,
      );
      expect(childNode.line.hit).to.deep.equal(
        summary1.line.hit + summary2.line.hit,
      );
      expect(childNode.line.miss).to.deep.equal(
        summary1.line.miss + summary2.line.miss,
      );
    });

    it('should throw an error if attempting to add a node with the same path as an existing summary', () => {
      const summary = new DetailedSummary(
        'test1',
        'test1',
        new DetailedRecord(10, 4),
        new DetailedRecord(11, 3),
        new DetailedRecord(12, 2),
      );
      const childNode = new TreeReportNode(
        'test',
        'test',
        new Record(10, 4),
        new Record(11, 3),
        new Record(12, 2),
        ['test1'],
        { test1: summary },
      );
      const childSummary = new DetailedSummary(
        'test',
        'test',
        new DetailedRecord(10, 4),
        new DetailedRecord(11, 3),
        new DetailedRecord(12, 2),
      );

      builder.addChildSummary(childSummary);
      expect(() => {
        builder.addChildNode(childNode);
      }).to.throw();
    });
  });
});
