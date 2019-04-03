import { relative } from '../../utils';

import TreeReport from '../reports/treeReport';
import { isLeaf, NodeOrLeaf } from '../reports/treeReportNode';
import DetailedSummary from '../summaries/detailedSummary';

import DetailedSummaryBuilder from './detailedSummaryBuilder';
import ReportBuilder from './reportBuilder';
import TreeReportNodeBuilder from './treeReportNodeBuilder';

class TreeReportBuilder extends ReportBuilder {
  protected _detailSummaries: { [index: string]: DetailedSummary } = {};

  public build(): TreeReport {
    if (!this._totalSummary) {
      throw new Error('Unable to build report: Not enough data!');
    }

    const details = this.buildDetailTree();

    return new TreeReport(this._totalSummary, this._paths, details);
  }

  protected getDetailSummaryBuilder(rootDirectory?: string): DetailedSummaryBuilder {
    return new DetailedSummaryBuilder(rootDirectory);
  }

  private buildDetailTree(): { [index: string]: NodeOrLeaf } {
    const groups = this.groupify(this._detailSummaries);
    const node = this.buildify(groups);
    if (isLeaf(node)) {
      return {
        [node.path]: node,
      };
    }
    return node.children;
  }

  private groupify(summaries: { [index: string]: DetailedSummary }, path: string = ''): any {
    // Return detailed summary if there is only one
    const keyCheck = Object.keys(summaries);
    if (keyCheck.length === 1) {
      return summaries[keyCheck[0]];
    }

    // Group summaries using the path of the summary
    const groups: { [index: string]: { summaries: { [index: string]: DetailedSummary }, path: string } } = {};
    for(const keyPath in summaries) {
      if (!summaries.hasOwnProperty(keyPath)) {
        continue;
      }
      const segments = relative(path || '/', keyPath).split('/').filter(s => s !== '');
      const group = segments.shift() || '';
      if (!groups[group]) {
        let newPath = group;
        if (path !== '') {
          newPath = `${path}/${group}`;
        }
        groups[group] = {
          path: newPath,
          summaries: {},
        };
      }
      groups[group].summaries[keyPath] = summaries[keyPath];
    }

    // Construct a tree of summaries using recursive calls
    const tree: { [index: string]: any } = {};
    for (const group in groups) {
      if (!groups.hasOwnProperty(group)) {
        continue;
      }
      const { path: groupPath, summaries: groupSummaries } = groups[group];

      const keys = Object.keys(groupSummaries);
      if (keys.length === 1) {
        tree[group] = groupSummaries[keys[0]];
      } else {
        tree[group] = this.groupify(groupSummaries, groupPath);
      }
    }

    return {
      path,
      tree,
    };
  }

  private buildify(rawNode: any, path: string = ''): NodeOrLeaf {
    if (!rawNode.tree) {
      return (rawNode as DetailedSummary);
    } else {
      const nodeBuilder = new TreeReportNodeBuilder(path);
      Object.values(rawNode.tree).forEach((rawTree: any) => {
        const childNode = this.buildify(rawTree, rawTree.path);
        if (isLeaf(childNode)) {
          nodeBuilder.addChildSummary(childNode);
        } else {
          nodeBuilder.addChildNode(childNode);
        }
      });
      return nodeBuilder.build();
    }
  }
}

export default TreeReportBuilder;
