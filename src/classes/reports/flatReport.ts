import DetailedSummary from '../summaries/detailedSummary';
import Summary from '../summaries/summary';

import Report from './report';

class FlatReport extends Report {
  protected _details: { [index: string]: DetailedSummary };

  constructor(
    total: Summary,
    paths: string[],
    details: { [index: string]: DetailedSummary },
  ) {
    super(total, paths, details);
    this._details = details;
  }

  public get details(): { [index: string]: DetailedSummary } {
    return this._details;
  }
}

export default FlatReport;
