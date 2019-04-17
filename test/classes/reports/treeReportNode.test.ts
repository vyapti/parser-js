import { assert, expect } from 'chai';
import 'mocha';

import DetailedRecord from '../../../src/classes/records/detailedRecord';
import Record from '../../../src/classes/records/record';
import TreeReportNode, {
  isLeaf,
} from '../../../src/classes/reports/treeReportNode';
import DetailedSummary from '../../../src/classes/summaries/detailedSummary';

describe('TreeReportNode', () => {
  describe('should construct properly', () => {
    it('with only required parameters', () => {
      const b = new Record(10, 4);
      const f = new Record(11, 5);
      const l = new Record(12, 6);
      const node = new TreeReportNode('test/path', 'test', b, f, l);
      expect(node).to.be.an.instanceOf(TreeReportNode);
      expect(node.path).to.equal('test/path');
      expect(node.name).to.equal('test');
      expect(node.branch).to.deep.equal(b);
      assert.notStrictEqual(node.branch, b);
      expect(node.function).to.deep.equal(f);
      assert.notStrictEqual(node.function, f);
      expect(node.line).to.deep.equal(l);
      assert.notStrictEqual(node.line, l);
      assert.isEmpty(node.childPaths);
      assert.isEmpty(node.children);
    });

    it('with optional child paths included', () => {
      const b = new Record(10, 4);
      const f = new Record(11, 5);
      const l = new Record(12, 6);
      const childPaths = ['test/path/child'];
      const node = new TreeReportNode('test/path', 'test', b, f, l, childPaths);
      expect(node).to.be.an.instanceOf(TreeReportNode);
      expect(node.path).to.equal('test/path');
      expect(node.name).to.equal('test');
      expect(node.branch).to.deep.equal(b);
      assert.notStrictEqual(node.branch, b);
      expect(node.function).to.deep.equal(f);
      assert.notStrictEqual(node.function, f);
      expect(node.line).to.deep.equal(l);
      assert.notStrictEqual(node.line, l);
      expect(node.childPaths).to.deep.equal(childPaths);
      assert.isNotEmpty(node.childPaths);
      assert.notStrictEqual(node.childPaths, childPaths);
      assert.isEmpty(node.children);
    });

    it('with optional children included', () => {
      const b = new Record(10, 4);
      const f = new Record(11, 5);
      const l = new Record(12, 6);
      const childPaths = ['test/path/child', 'test/path/child1'];
      const summary = new DetailedSummary(
        'test/path/child',
        'test',
        new DetailedRecord(1, 1),
        new DetailedRecord(1, 1),
        new DetailedRecord(1, 1),
      );
      const childNode = new TreeReportNode('test/path/child1', 'test', b, f, l);
      const children = {
        'test/path/child': summary,
        'test/path/child1': childNode,
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
      expect(node).to.be.an.instanceOf(TreeReportNode);
      expect(node.path).to.equal('test/path');
      expect(node.name).to.equal('test');
      expect(node.branch).to.deep.equal(b);
      assert.notStrictEqual(node.branch, b);
      expect(node.function).to.deep.equal(f);
      assert.notStrictEqual(node.function, f);
      expect(node.line).to.deep.equal(l);
      assert.notStrictEqual(node.line, l);
      expect(node.childPaths).to.deep.equal(childPaths);
      assert.notStrictEqual(node.childPaths, childPaths);
      expect(node.children).to.deep.equal(children);
      assert.notStrictEqual(node.children, children);
    });
  });

  it('should clone properly', () => {
    const b = new Record(10, 4);
    const f = new Record(11, 5);
    const l = new Record(12, 6);
    const childPaths = ['test/path/child', 'test/path/child1'];
    const summary = new DetailedSummary(
      'test/path/child',
      'test',
      new DetailedRecord(1, 1),
      new DetailedRecord(1, 1),
      new DetailedRecord(1, 1),
    );
    const childNode = new TreeReportNode('test/path/child1', 'test', b, f, l);
    const children = {
      'test/path/child': summary,
      'test/path/child1': childNode,
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
    const cloned = node.clone();
    expect(cloned).to.be.an.instanceOf(TreeReportNode);
    expect(cloned.path).to.equal(node.path);
    expect(cloned.name).to.equal(node.name);
    expect(cloned.branch).to.deep.equal(node.branch);
    expect(cloned.function).to.deep.equal(node.function);
    expect(cloned.line).to.deep.equal(node.line);
    expect(cloned.childPaths).to.deep.equal(node.childPaths);
    expect(cloned.children).to.deep.equal(node.children);
    expect(cloned).to.deep.equal(node);
    assert.notStrictEqual(cloned, node);
  });

  it('should clone instead of combine when called with different path', () => {
    const b = new Record(10, 4);
    const f = new Record(11, 5);
    const l = new Record(12, 6);
    const childPaths = ['test/path/child', 'test/path/child1'];
    const summary = new DetailedSummary(
      'test/path/child',
      'test',
      new DetailedRecord(1, 1),
      new DetailedRecord(1, 1),
      new DetailedRecord(1, 1),
    );
    const childNode = new TreeReportNode('test/path/child1', 'test', b, f, l);
    const children = {
      'test/path/child': summary,
      'test/path/child1': childNode,
    };
    const node1 = new TreeReportNode(
      'test/path',
      'test',
      b,
      f,
      l,
      childPaths,
      children,
    );
    const node2 = new TreeReportNode(
      'test/path1',
      'test',
      b,
      f,
      l,
      childPaths,
      children,
    );
    const combined = node1.combine(node2);
    expect(combined).to.be.an.instanceOf(TreeReportNode);
    expect(combined.path).to.equal(node1.path);
    expect(combined.name).to.equal(node1.name);
    expect(combined.branch).to.deep.equal(node1.branch);
    expect(combined.function).to.deep.equal(node1.function);
    expect(combined.line).to.deep.equal(node1.line);
    expect(combined.childPaths).to.deep.equal(node1.childPaths);
    expect(combined.children).to.deep.equal(node1.children);
    expect(combined).to.deep.equal(node1);
    assert.notStrictEqual(combined, node1);
  });

  describe('should combine properly when called with same path', () => {
    it('and current node has a name set', () => {
      const b = new Record(10, 4);
      const f = new Record(11, 5);
      const l = new Record(12, 6);
      const node1 = new TreeReportNode('test/path', 'test', b, f, l);
      const node2 = new TreeReportNode('test/path', 'test1', b, f, l);
      const combined = node1.combine(node2);
      expect(combined).to.be.an.instanceOf(TreeReportNode);
      expect(combined.branch).to.deep.equal(b.combine(b));
      expect(combined.function).to.deep.equal(f.combine(f));
      expect(combined.line).to.deep.equal(l.combine(l));
      expect(combined.path).to.equal('test/path');
      expect(combined.name).to.equal('test');
    });

    it('and current node does not have a name set', () => {
      const b = new Record(10, 4);
      const f = new Record(11, 5);
      const l = new Record(12, 6);
      const node1 = new TreeReportNode('test/path', '', b, f, l);
      const node2 = new TreeReportNode('test/path', 'test1', b, f, l);
      const combined = node1.combine(node2);
      expect(combined).to.be.an.instanceOf(TreeReportNode);
      expect(combined.branch).to.deep.equal(b.combine(b));
      expect(combined.function).to.deep.equal(f.combine(f));
      expect(combined.line).to.deep.equal(l.combine(l));
      expect(combined.path).to.equal('test/path');
      expect(combined.name).to.equal('test1');
    });

    it('and current and other node both do not have name set', () => {
      const b = new Record(10, 4);
      const f = new Record(11, 5);
      const l = new Record(12, 6);
      const node1 = new TreeReportNode('test/path', '', b, f, l);
      const node2 = new TreeReportNode('test/path', '', b, f, l);
      const combined = node1.combine(node2);
      expect(combined).to.be.an.instanceOf(TreeReportNode);
      expect(combined.branch).to.deep.equal(b.combine(b));
      expect(combined.function).to.deep.equal(f.combine(f));
      expect(combined.line).to.deep.equal(l.combine(l));
      expect(combined.path).to.equal('test/path');
      expect(combined.name).to.equal('');
    });

    it('and children/childPaths are shared', () => {
      const b = new Record(10, 4);
      const f = new Record(11, 5);
      const l = new Record(12, 6);
      const childPaths1 = ['test/path/child', 'test/path/child1'];
      const summary1 = new DetailedSummary(
        'test/path/child',
        'test',
        new DetailedRecord(1, 1),
        new DetailedRecord(1, 1),
        new DetailedRecord(1, 1),
      );
      const childNode1 = new TreeReportNode(
        'test/path/child1',
        'test',
        b,
        f,
        l,
      );
      const children1 = {
        'test/path/child': summary1,
        'test/path/child1': childNode1,
      };
      const node1 = new TreeReportNode(
        'test/path',
        'test',
        b,
        f,
        l,
        childPaths1,
        children1,
      );
      const node2 = new TreeReportNode(
        'test/path',
        'test',
        b,
        f,
        l,
        childPaths1,
        children1,
      );
      const combined = node1.combine(node2);
      const combinedFlipped = node2.combine(node1);
      expect(combined).to.be.an.instanceOf(TreeReportNode);
      expect(combined.name).to.equal('test');
      expect(combined.branch).to.deep.equal(b.combine(b));
      expect(combined.function).to.deep.equal(f.combine(f));
      expect(combined.line).to.deep.equal(l.combine(l));
      expect(combined.childPaths).to.deep.equal(childPaths1);
      expect(combined).to.deep.equal(combinedFlipped);
      assert.notStrictEqual(combined, combinedFlipped);
    });

    it('and children/childPaths do not overlap', () => {
      const b = new Record(10, 4);
      const f = new Record(11, 5);
      const l = new Record(12, 6);
      const childPaths1 = ['test/path/child', 'test/path/child1'];
      const summary1 = new DetailedSummary(
        'test/path/child',
        'test',
        new DetailedRecord(1, 1),
        new DetailedRecord(1, 1),
        new DetailedRecord(1, 1),
      );
      const childNode1 = new TreeReportNode(
        'test/path/child1',
        'test',
        b,
        f,
        l,
      );
      const children1 = {
        'test/path/child': summary1,
        'test/path/child1': childNode1,
      };
      const node1 = new TreeReportNode(
        'test/path',
        'test',
        b,
        f,
        l,
        childPaths1,
        children1,
      );
      const childPaths2 = ['test/path/child2', 'test/path/child3'];
      const summary2 = new DetailedSummary(
        'test/path/child2',
        'test',
        new DetailedRecord(1, 1),
        new DetailedRecord(1, 1),
        new DetailedRecord(1, 1),
      );
      const childNode2 = new TreeReportNode(
        'test/path/child3',
        'test',
        b,
        f,
        l,
      );
      const children2 = {
        'test/path/child2': summary2,
        'test/path/child3': childNode2,
      };
      const node2 = new TreeReportNode(
        'test/path',
        'test',
        b,
        f,
        l,
        childPaths2,
        children2,
      );
      const combined = node1.combine(node2);
      const combinedFlipped = node2.combine(node1);
      expect(combined).to.be.an.instanceOf(TreeReportNode);
      expect(combined.name).to.equal('test');
      expect(combined.branch).to.deep.equal(b.combine(b));
      expect(combined.function).to.deep.equal(f.combine(f));
      expect(combined.line).to.deep.equal(l.combine(l));
      expect(combined.childPaths).to.deep.equal(
        childPaths1.concat(childPaths2),
      );
      assert.notStrictEqual(combined, combinedFlipped);
      expect(Object.keys(combined.children)).to.have.lengthOf(4);
      expect(combined.childPaths).has.deep.members(combinedFlipped.childPaths);
    });
  });

  describe('isLeaf', () => {
    it('should return true when DetailedSummary is given', () => {
      const summary = new DetailedSummary(
        'test',
        'test',
        new DetailedRecord(1, 1),
        new DetailedRecord(1, 1),
        new DetailedRecord(1, 1),
      );
      assert.isTrue(isLeaf(summary));
    });

    it('should return false when TreeReportNode is given', () => {
      const node = new TreeReportNode(
        'test',
        'test',
        new Record(1, 1),
        new Record(1, 1),
        new Record(1, 1),
      );
      assert.isFalse(isLeaf(node));
    });
  });
});
