import FlatReport from '../reports/flatReport';
import DetailedSummary from '../summaries/detailedSummary';

import DetailedSummaryBuilder from './detailedSummaryBuilder';
import ReportBuilder from './reportBuilder';

/**
 * Flat Report Builder
 *
 * An extension of {@link ReportBuilder | ReportBuilder} that builds a
 * FlatReport instead of a regular Report.
 */
class FlatReportBuilder extends ReportBuilder {
  /**
   * DetailedSummary Builder for section totals
   *
   * @hidden
   */
  protected _detailBuilder: DetailedSummaryBuilder = new DetailedSummaryBuilder();

  /**
   * Map of built DetailedSummaries keyed by summary paths
   *
   * @hidden
   */
  protected _detailSummaries: { [index: string]: DetailedSummary } = {};

  /**
   * Construct a ReportBuilder
   *
   * @param rootDirectory base path that the incoming file path should be
   *                      relativized with
   */
  constructor(rootDirectory: string = '') {
    super(rootDirectory);
    // TODO: does this need to be here? this._detailBuilder is constructed
    // when it is defined above, so this doesn't appear to be necessary...
    this._detailBuilder = new DetailedSummaryBuilder(this._rootDirectory);
  }

  /**
   * Build a FlatReport
   *
   * Use the parsed data to build a FlatReport. If at least on section of data
   * has not been parsed yet, this method will throw an error.
   *
   * @returns FlatReport containing parsed data
   * @throws when builder has not received at least one section of data
   */
  public build(): FlatReport {
    if (!this._totalSummary) {
      throw new Error('Unable to build report: Not enough data!');
    }
    return new FlatReport(
      this._totalSummary,
      this._paths,
      this._detailSummaries,
    );
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
}

export default FlatReportBuilder;
