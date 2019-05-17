import Summary from '../summaries/summary';

import Report from './report';
import { NodeOrLeaf } from './treeReportNode';

/**
 * Tree Coverage Report
 *
 * An extension of {@link Report | Report} that stores a tree of Summary
 * objects that matches the directory structure of the set of paths stored
 * in the report.
 */
class TreeReport extends Report {
  /**
   * Map of detail nodes for this Report
   *
   * @hidden
   */
  protected _details: { [index: string]: NodeOrLeaf };

  constructor(
    total: Summary,
    paths: string[],
    details: { [index: string]: NodeOrLeaf },
  ) {
    super(total, paths, details);
    this._details = {};
    Object.keys(details).forEach(key => {
      this._details[key] = details[key].clone();
    });
  }

  /**
   * Map of detail nodes for this report
   *
   * The nodes are keyed based on directory groups within the set of paths.
   *
   * @remarks
   * The following tree structure would generate the following details map:
   * ```
   * Tree Structure:
   *   |
   *   |`- Leaf        (DetailedSummary)
   *   |
   *   `-- GroupA      (TreeReportNode)
   *         |
   *         |`- Leaf1 (DetailedSummary)
   *         |
   *         `-- Leaf2 (DetailedSummary)
   *
   * details:
   * {
   *   'Leaf': DetailedSummary,
   *   'GroupA': TreeReportNode, // contains Leaf1 and Leaf2 as children
   * }
   *
   */
  public get details(): { [index: string]: NodeOrLeaf } {
    return this._details;
  }
}

export default TreeReport;
