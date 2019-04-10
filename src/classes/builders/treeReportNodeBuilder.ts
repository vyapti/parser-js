import { relative } from '../../utils';

import Record from '../records/record';
import TreeReportNode from '../reports/treeReportNode';
import DetailedSummary from '../summaries/detailedSummary';
import Summary from '../summaries/summary';

class TreeReportNodeBuilder {
  private _rootPath: string = '';
  private _childPaths: string[] = [];
  private _children: {
    [index: string]: DetailedSummary | TreeReportNode;
  } = {};

  private _nodeSummary?: Summary;

  constructor(rootPath: string = '') {
    this._rootPath = rootPath;
  }

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

  private isLeaf(n: TreeReportNode | DetailedSummary): n is DetailedSummary {
    return !(n as TreeReportNode).children;
  }
}

export default TreeReportNodeBuilder;
