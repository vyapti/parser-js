import { assert, expect } from 'chai';

import TreeReportBuilder from '../../../../src/classes/builders/treeReportBuilder';
import TreeReport from '../../../../src/classes/reports/treeReport';
import TreeReportNode, {
  isLeaf,
  NodeOrLeaf,
} from '../../../../src/classes/reports/treeReportNode';
import DetailedSummary from '../../../../src/classes/summaries/detailedSummary';
import { InfoTypes } from '../../../../src/utils';

import { reportBuilderTests } from './reportBuilder.test';

function isNode(n: NodeOrLeaf): n is TreeReportNode {
  return !!(n as TreeReportNode).children;
}

describe('TreeReportBuilder', () => {
  describe('in conformance to ReportBuilder', () => {
    reportBuilderTests(TreeReportBuilder, TreeReport, TreeReportNode, d => {
      return isLeaf(d) || isNode(d);
    });
  });

  describe('build', () => {
    let builder: TreeReportBuilder;

    beforeEach(() => {
      builder = new TreeReportBuilder('/d:/root/path');
    });

    it('should properly relate all paths to root directory', () => {
      // Enter the first section data
      builder.parse(`${InfoTypes.TestName}:Test1`);
      builder.parse(`${InfoTypes.SourceFile}:/d:/root/path/test/1`);
      builder.parse(`${InfoTypes.FunctionFoundCount}:12`);
      builder.parse(`${InfoTypes.FunctionHitCount}:10`);
      builder.parse(`${InfoTypes.LineFoundCount}:10`);
      builder.parse(`${InfoTypes.LineHitCount}:8`);
      builder.parse(`${InfoTypes.BranchFoundCount}:8`);
      builder.parse(`${InfoTypes.BranchHitCount}:6`);
      builder.parse(`${InfoTypes.EndSection}`);

      // Enter the second section data
      builder.parse(`${InfoTypes.TestName}:Test2`);
      builder.parse(`${InfoTypes.SourceFile}:/d:/root/path/test/2`);
      builder.parse(`${InfoTypes.FunctionFoundCount}:14`);
      builder.parse(`${InfoTypes.FunctionHitCount}:12`);
      builder.parse(`${InfoTypes.LineFoundCount}:15`);
      builder.parse(`${InfoTypes.LineHitCount}:13`);
      builder.parse(`${InfoTypes.BranchFoundCount}:14`);
      builder.parse(`${InfoTypes.BranchHitCount}:12`);
      builder.parse(`${InfoTypes.EndSection}`);

      // Enter the third section data
      builder.parse(`${InfoTypes.TestName}:Test3`);
      builder.parse(`${InfoTypes.SourceFile}:/d:/root/path/othertest`);
      builder.parse(`${InfoTypes.FunctionFoundCount}:13`);
      builder.parse(`${InfoTypes.FunctionHitCount}:11`);
      builder.parse(`${InfoTypes.LineFoundCount}:11`);
      builder.parse(`${InfoTypes.LineHitCount}:9`);
      builder.parse(`${InfoTypes.BranchFoundCount}:9`);
      builder.parse(`${InfoTypes.BranchHitCount}:7`);
      builder.parse(`${InfoTypes.EndSection}`);

      const report = builder.build();
      expect(report).to.be.an.instanceOf(TreeReport);
      Object.values(report.details).forEach(d => {
        assert.isTrue(isLeaf(d) || isNode(d));
      });
      expect(report.paths).to.have.lengthOf(3);
      expect(report.paths).to.contain('test/1');
      expect(report.paths).to.contain('test/2');
      expect(report.paths).to.contain('othertest');
    });

    it('should properly group similar paths together when building', () => {
      builder = new TreeReportBuilder();

      // Enter the first section data
      builder.parse(`${InfoTypes.TestName}:Test1`);
      builder.parse(`${InfoTypes.SourceFile}:/root/1`);
      builder.parse(`${InfoTypes.FunctionFoundCount}:12`);
      builder.parse(`${InfoTypes.FunctionHitCount}:10`);
      builder.parse(`${InfoTypes.LineFoundCount}:10`);
      builder.parse(`${InfoTypes.LineHitCount}:8`);
      builder.parse(`${InfoTypes.BranchFoundCount}:8`);
      builder.parse(`${InfoTypes.BranchHitCount}:6`);
      builder.parse(`${InfoTypes.EndSection}`);

      // Enter the second section data
      builder.parse(`${InfoTypes.TestName}:Test2`);
      builder.parse(`${InfoTypes.SourceFile}:/root/2`);
      builder.parse(`${InfoTypes.FunctionFoundCount}:14`);
      builder.parse(`${InfoTypes.FunctionHitCount}:12`);
      builder.parse(`${InfoTypes.LineFoundCount}:15`);
      builder.parse(`${InfoTypes.LineHitCount}:13`);
      builder.parse(`${InfoTypes.BranchFoundCount}:14`);
      builder.parse(`${InfoTypes.BranchHitCount}:12`);
      builder.parse(`${InfoTypes.EndSection}`);

      // Enter the third section data
      builder.parse(`${InfoTypes.TestName}:Test3`);
      builder.parse(`${InfoTypes.SourceFile}:/`);
      builder.parse(`${InfoTypes.FunctionFoundCount}:13`);
      builder.parse(`${InfoTypes.FunctionHitCount}:11`);
      builder.parse(`${InfoTypes.LineFoundCount}:11`);
      builder.parse(`${InfoTypes.LineHitCount}:9`);
      builder.parse(`${InfoTypes.BranchFoundCount}:9`);
      builder.parse(`${InfoTypes.BranchHitCount}:7`);
      builder.parse(`${InfoTypes.EndSection}`);

      const report = builder.build();
      expect(report).to.be.an.instanceOf(TreeReport);
      Object.values(report.details).forEach(d => {
        assert.isTrue(isLeaf(d) || isNode(d));
      });

      expect(Object.keys(report.details)).to.have.lengthOf(2);
      expect(report.details).to.have.property('/root');
      expect(report.details).to.have.property('/');

      expect(report.details['/root']).to.be.an.instanceOf(TreeReportNode);
      const rootNode = report.details['/root'] as TreeReportNode;
      expect(rootNode.childPaths).to.have.lengthOf(2);
      expect(rootNode.childPaths).to.contain('/root/1');
      expect(rootNode.childPaths).to.contain('/root/2');

      expect(report.details['/']).to.be.an.instanceOf(DetailedSummary);
    });
  });
});
