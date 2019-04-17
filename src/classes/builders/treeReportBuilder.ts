import relative, { isRoot, normalizeRoot } from '../../utils/relative';

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

  protected getDetailSummaryBuilder(
    rootDirectory?: string,
  ): DetailedSummaryBuilder {
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

  private groupify(
    summaries: { [index: string]: DetailedSummary },
    path: string = '',
  ): any {
    // Return detailed summary if there is only one
    const keys = Object.keys(summaries);
    if (keys.length === 1) {
      return summaries[keys[0]];
    }

    // Group summaries using the path of the summary
    const groups: {
      [index: string]: {
        summaries: { [index: string]: DetailedSummary };
        path: string;
      };
    } = {};
    keys.forEach(keyPath => {
      const segments = relative(path, keyPath)
        .split('/')
        .filter(s => s !== '');
      let group = segments.shift() || '';
      // If we have no starting path and the key path is a root,
      // use the root from the key path to construct the group.
      // This allow the relative() call to work properly if nested
      // groupify calls are necessary
      if (path === '' && isRoot(keyPath)) {
        const [keyRoot] = normalizeRoot(keyPath);
        group = `${keyRoot}${group}`;
      }
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
    });

    // Construct a tree of summaries using recursive calls
    const tree: { [index: string]: any } = {};
    Object.keys(groups).forEach(group => {
      const { path: groupPath, summaries: groupSummaries } = groups[group];

      const keys2 = Object.keys(groupSummaries);
      if (keys2.length === 1) {
        tree[group] = groupSummaries[keys2[0]];
      } else {
        tree[group] = this.groupify(groupSummaries, groupPath);
      }
    });

    return {
      path,
      tree,
    };
  }

  private buildify(rawNode: any, path: string = ''): NodeOrLeaf {
    if (!rawNode.tree) {
      return rawNode as DetailedSummary;
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
