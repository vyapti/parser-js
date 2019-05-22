import { relative } from '../../utils';

import Record from '../records/record';
import TreeReportNode from '../reports/treeReportNode';
import DetailedSummary from '../summaries/detailedSummary';
import Summary from '../summaries/summary';

/**
 * TreeReportNode Builder
 *
 * Build a TreeReportNode from parsed DetailedSummaries.
 */
class TreeReportNodeBuilder {
  /**
   * the root path of this node
   *
   * @hidden
   */
  private _rootPath: string = '';

  /**
   * List of paths for children of this node
   *
   * @hidden
   */
  private _childPaths: string[] = [];

  /**
   * Map of children of this Node, keyed by node group name
   * (or path if it is a leaf).
   *
   * @hidden
   */
  private _children: {
    [index: string]: DetailedSummary | TreeReportNode;
  } = {};

  /**
   * Summary of totals for this node
   *
   * @hidden
   */
  private _nodeSummary?: Summary;

  /**
   * Construct a TreeReportNodeBuilder
   *
   * @param rootPath the root path for this node - all children contain this
   *                 root in their paths
   */
  constructor(rootPath: string = '') {
    this._rootPath = rootPath;
  }

  /**
   * Build a TreeReportNode
   *
   * Use the parsed data to build a TreeReportNode. If at least one child node
   * or summary has not been added, this method will throw an error.
   *
   * @returns TreeReportNode containing parsed data
   * @throws when builder has not received at least one child
   */
  public build(): TreeReportNode {
    if (!this._nodeSummary) {
      throw new Error('Unable to build tree report node -- not enough data!');
    }
    // filter out duplicate child paths (if there are any)
    const childPaths: string[] = Array.from(new Set(this._childPaths).keys());

    const { path, name, branch, function: func, line } = this._nodeSummary;
    return new TreeReportNode(
      path,
      name,
      branch,
      func,
      line,
      childPaths,
      this._children,
    );
  }

  /**
   * Add DetailedSummary as child
   *
   * @param child Summary to add as child
   */
  public addChildSummary(child: DetailedSummary): void {
    const related = relative(this._rootPath, child.path);
    if (this._children[related]) {
      // children already contains data at this path, combine if possible
      if (!this.isLeaf(this._children[related])) {
        throw new Error(
          'Cannot combine a summary with an existing node at this path!',
        );
      }

      this._children[related] = (this._children[
        related
      ] as DetailedSummary).combine(child);
    } else {
      this._children[related] = child;
    }
    // Add path
    this._childPaths.push(child.path);

    // Convert detailed records to regular records
    const [branch, func, line] = [child.branch, child.function, child.line].map(
      dr => new Record(dr.total, dr.hit, dr.miss),
    );

    // Update node summary
    const summary = new Summary(
      this._rootPath,
      this._rootPath,
      branch,
      func,
      line,
    );
    if (!this._nodeSummary) {
      this._nodeSummary = summary;
    } else {
      this._nodeSummary = this._nodeSummary.combine(summary);
    }
  }

  /**
   * Add TreeReportNode as child
   *
   * @param child TreeReportNode to add as child
   */
  public addChildNode(child: TreeReportNode): void {
    const related = relative(this._rootPath, child.path);
    if (this._children[related]) {
      // children already contains a data at this path, combine if possible
      if (this.isLeaf(this._children[related])) {
        throw new Error(
          'Cannot combine a node with an existing summary at this path!',
        );
      }

      this._children[related] = (this._children[
        related
      ] as TreeReportNode).combine(child);
    } else {
      this._children[related] = child;
    }

    // Add paths
    this._childPaths = this._childPaths.concat(child.childPaths);

    // Convert detailed records to regular records
    const [branch, func, line] = [child.branch, child.function, child.line].map(
      dr => new Record(dr.total, dr.hit, dr.miss),
    );

    // Update node summary
    const summary = new Summary(
      this._rootPath,
      this._rootPath,
      branch,
      func,
      line,
    );
    if (!this._nodeSummary) {
      this._nodeSummary = summary;
    } else {
      this._nodeSummary = this._nodeSummary.combine(summary);
    }
  }

  // TODO: move to using the isLeaf method exported from TreeReportNode.ts
  /**
   * Determine if input is a Leaf
   *
   * @param n node (or leaf) to test
   *
   * @hidden
   */
  private isLeaf(n: TreeReportNode | DetailedSummary): n is DetailedSummary {
    return !(n as TreeReportNode).children;
  }
}

export default TreeReportNodeBuilder;
