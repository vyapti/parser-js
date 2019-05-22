import { ICloneable, ICombinable } from '../../types';

import Record from '../records/record';
import DetailedSummary from '../summaries/detailedSummary';
import Summary from '../summaries/summary';

/**
 * Convenience type for creating a tree-like structure
 */
export type NodeOrLeaf = TreeReportNode | DetailedSummary;

/**
 * Determine if input is a Leaf
 *
 * @param n node (or leaf) to test
 */
export function isLeaf(n: NodeOrLeaf): n is DetailedSummary {
  return !(n as TreeReportNode).children;
}

/**
 * Tree Report Node
 *
 * An extension of {@link Summary | Summary} that also includes a set of child
 * `TreeReportNode`s or `DetailedSummary`s to create a tree-like structure.
 * This is used by the {@link TreeReport | TreeReport} to build a hierarchy
 * that matches a directory structure for a set of paths.
 */
class TreeReportNode extends Summary
  implements ICloneable<TreeReportNode>, ICombinable<TreeReportNode> {
  /**
   * List of paths that are desendents of this node
   *
   * @hidden
   */
  protected _childPaths: string[] = [];

  /**
   * Children of this node
   *
   * @hidden
   */
  protected _children: {
    [index: string]: NodeOrLeaf;
  } = {};

  /**
   * Construct a Tree Report Node
   *
   * @param path       path associated with summary data
   * @param name       name associated with summary data
   * @param branch     Record for branch data to store
   * @param func       Record for function data to store
   * @param line       Record for line data to store
   * @param childPaths Descendents of this node
   * @param children   Child nodes of this node
   */
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
    if (childPaths) {
      this._childPaths = childPaths.slice(0);
    }
    if (children) {
      this._children = {};
      Object.keys(children).forEach(key => {
        this._children[key] = children[key].clone();
      });
    }
  }

  /**
   * List of paths that are descendents of this node
   *
   * @readonly
   */
  public get childPaths() {
    return this._childPaths;
  }

  /**
   * Child nodes or leafs of this node
   *
   * @readonly
   */
  public get children() {
    return this._children;
  }

  public combine(other: TreeReportNode): TreeReportNode {
    const cloned = this.clone();
    if (this.path !== other.path) {
      return cloned;
    }
    cloned._name = this.name || other.name;
    cloned._branch = this.branch.combine(other.branch);
    cloned._function = this.function.combine(other.function);
    cloned._line = this.line.combine(other.line);

    Object.keys(other.children).forEach((key: string) => {
      if (cloned.children[key]) {
        const typeCheck =
          (isLeaf(cloned.children[key]) ? 1 : 0) +
          (isLeaf(other.children[key]) ? 1 : 0);
        if (typeCheck === 2) {
          // both objects are leaves, combine them using typecasting
          cloned._children[key] = (cloned.children[
            key
          ] as DetailedSummary).combine(other.children[key] as DetailedSummary);
        } else if (typeCheck === 0) {
          // both objects are tree nodes, combine them using typecasting
          cloned._children[key] = (cloned.children[
            key
          ] as TreeReportNode).combine(other.children[key] as TreeReportNode);
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
