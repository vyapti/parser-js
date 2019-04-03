import FlatReport from '../reports/flatReport';
import DetailedSummary from '../summaries/detailedSummary';

import DetailedSummaryBuilder from './detailedSummaryBuilder';
import ReportBuilder from './reportBuilder';


class FlatReportBuilder extends ReportBuilder {
  protected _detailBuilder: DetailedSummaryBuilder = new DetailedSummaryBuilder();
  protected _detailSummaries: { [index: string]: DetailedSummary } = {};

  constructor(rootDirectory: string = '') {
    super(rootDirectory);
    this._detailBuilder = new DetailedSummaryBuilder(this._rootDirectory);
  }

  public build(): FlatReport {
    if (!this._totalSummary) {
      throw new Error('Unable to build report: Not enough data!');
    }
    return new FlatReport(this._totalSummary, this._paths, this._detailSummaries);
  }

  protected getDetailSummaryBuilder(rootDirectory?: string): DetailedSummaryBuilder {
    return new DetailedSummaryBuilder(rootDirectory);
  }
}

export default FlatReportBuilder;
