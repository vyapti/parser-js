import relative, { isRoot, normalizeRoot } from '../../utils/relative';

import TreeReport from '../reports/treeReport';
import { isLeaf, NodeOrLeaf } from '../reports/treeReportNode';
import DetailedSummary from '../summaries/detailedSummary';

import DetailedSummaryBuilder from './detailedSummaryBuilder';
import ReportBuilder from './reportBuilder';
import TreeReportNodeBuilder from './treeReportNodeBuilder';

/**
 * Tree Report Builder
 *
 * An extension of {@link ReportBuilder | ReportBuilder} that builds a
 * TreeReport instead of a regular Report.
 */
class TreeReportBuilder extends ReportBuilder {
  /**
   * Map of built DetailedSummaries keyed by summary paths
   */
  protected _detailSummaries: { [index: string]: DetailedSummary } = {};

  /**
   * Build a TreeReport
   *
   * Use the parsed data to build a TreeReport. If at least on section of data
   * has not been parsed yet, this method will throw an error.
   *
   * @returns TreeReport containing parsed data
   * @throws when builder has not received at least one section of data
   */
  public build(): TreeReport {
    if (!this._totalSummary) {
      throw new Error('Unable to build report: Not enough data!');
    }

    const details = this.buildDetailTree();

    return new TreeReport(this._totalSummary, this._paths, details);
  }

  /**
   * Build a new DetailedSummaryBuilder for a detail section
   *
   * @param rootDirectory option to pass to DetailedSummaryBuilder constructor
   * @returns DetailedSummaryBuilder
   *
   */
  protected getDetailSummaryBuilder(
    rootDirectory?: string,
  ): DetailedSummaryBuilder {
    return new DetailedSummaryBuilder(rootDirectory);
  }

  /**
   * Helper method to transform the map of DetailedSummaries to a tree of
   * TreeReportNodes or DetailedSummaries.
   *
   * @remarks
   * This method relies on two other helper methods to 1) group the paths in
   * the tree structure and 2) Apply the DetailedSummaries to the tree
   * structure
   *
   * @returns Detail Map to use for TreeReport
   */
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

  /**
   * Helper method to group paths of Detailed Summaries together in a tree-like
   * structure.
   *
   * @param summaries DetailedSummary map to group
   * @param path root path for the group
   *
   * @hidden
   */
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

  /**
   * Helper method to built TreeReportNodes using the tree-like structure
   *
   * @param rawNode Tree-like structure to use as the basis of the Detail Tree
   * @param path path to use as root for the group
   *
   * @hidden
   */
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
