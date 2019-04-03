import Cloneable from '../../interfaces/cloneable';
import Combinable from '../../interfaces/combinable';

import Record from '../records/record';
import DetailedSummary from '../summaries/detailedSummary';
import Summary from '../summaries/summary';

export type NodeOrLeaf = TreeReportNode | DetailedSummary;

export function isLeaf(n: NodeOrLeaf): n is DetailedSummary {
  return !(n as TreeReportNode).children;
}

class TreeReportNode extends Summary implements Cloneable<TreeReportNode>, Combinable<TreeReportNode> {
  protected _childPaths: string[] = [];
  protected _children: {
    [index: string]: NodeOrLeaf;
  } = {};

  constructor(
    path: string,
    name: string,
    branch: Record,
    func: Record,
    line: Record,
    childPaths?: string[],
    children?: { [index: string]: NodeOrLeaf },
  ) {
    super(path, name, branch, func, line);
    this._childPaths = childPaths || [];
    this._children = children || {};
  }

  public get childPaths() {
    return this._childPaths;
  }

  public get children() {
    return this._children;
  }

  public combine(other: TreeReportNode): TreeReportNode {
    const cloned = this.clone();
    cloned._name = this.name || other.name;
    if (this.path === other.path) {
      return cloned;
    }

    Object.keys(other.children).forEach((key: string) => {
      if (cloned.children[key]) {
        const typeCheck =
          (isLeaf(cloned.children[key]) ? 1 : 0) +
          (isLeaf(other.children[key]) ? 1 : 0);
        if (typeCheck === 2) {
          // both objects are leaves, combine them using typecasting
          cloned._children[key] = (cloned.children[
            key
          ] as DetailedSummary).combine(other.children[
            key
          ] as DetailedSummary);
        } else if (typeCheck === 0) {
          // both objects are tree nodes, combine them using typecasting
          cloned._children[key] = (cloned.children[
            key
          ] as TreeReportNode).combine(other.children[
            key
          ] as TreeReportNode);
        }
      } else {
        cloned.children[key] = other.children[key].clone();
        cloned.childPaths.push(other.children[key].path);
      }
    });

    return cloned;
  }

  public clone(): TreeReportNode {
    const clonedChildren: { [index: string]: NodeOrLeaf } = {};
    Object.keys(this._children).forEach(key => {
      clonedChildren[key] = this._children[key].clone();
    });
    return new TreeReportNode(
      this.path,
      this.name,
      this._branch.clone(),
      this.function.clone(),
      this.line.clone(),
      this.childPaths.slice(0),
      clonedChildren,
    );
  }
}

export default TreeReportNode;
