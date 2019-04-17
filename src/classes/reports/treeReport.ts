import Summary from '../summaries/summary';

import Report from './report';
import { NodeOrLeaf } from './treeReportNode';

class TreeReport extends Report {
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

  public get details(): { [index: string]: NodeOrLeaf } {
    return this._details;
  }
}

export default TreeReport;
