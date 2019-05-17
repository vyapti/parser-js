import { InfoTypes } from '../../utils';

import Report from '../reports/report';
import Summary from '../summaries/summary';

import SummaryBuilder from './summaryBuilder';

/**
 * Report Builder
 *
 * Build a Report from LCOV formatted data.
 */
class ReportBuilder {
  /**
   * SummaryBuilder for report totals
   *
   * @hidden
   */
  protected _totalBuilder: SummaryBuilder = new SummaryBuilder();

  /**
   * Summary containing report totals
   *
   * @hidden
   */
  protected _totalSummary?: Summary;

  /**
   * SummaryBuilder for section totals
   *
   * @hidden
   */
  protected _detailBuilder: SummaryBuilder = new SummaryBuilder();

  /**
   * Map of built Summaries keyed by summary paths
   *
   * @hidden
   */
  protected _detailSummaries: { [index: string]: Summary } = {};

  /**
   * Tracked paths that have been parsed
   *
   * @hidden
   */
  protected _paths: string[] = [];

  /**
   * The root directory that all paths are relativized with
   *
   * @hidden
   */
  protected _rootDirectory: string = '';

  /**
   * Construct a ReportBuilder
   *
   * @param rootDirectory base path that the incoming file path should be
   *                      relativized with
   */
  constructor(rootDirectory: string = '') {
    this._rootDirectory = rootDirectory;
    // TODO: do these need to be here? both are constructed when they are
    // defined above, so this doesn't appear to be necessary...
    this._totalBuilder = new SummaryBuilder(rootDirectory);
    this._detailBuilder = this.getDetailSummaryBuilder(rootDirectory);
  }

  /**
   * Build a Report
   *
   * Use the parsed data to build a Report. If at least one section of data has
   * not been parsed yet, this method will throw an error.
   *
   * @returns Report containing parsed data
   * @throws when builder has not received at least one section of data
   */
  public build(): Report {
    if (!this._totalSummary) {
      throw new Error('Unable to build report: Not enough data!');
    }
    return new Report(this._totalSummary, this._paths, this._detailSummaries);
  }

  /**
   * Parse a line of data
   *
   * Parse a line of data that matches the LCOV format. Data will contribute to
   * both the section's summary data as well as total summary data for the
   * report.
   *
   * @param line data to parse
   */
  public parse(line: string): void {
    if (!line.trim().length) {
      return;
    }

    this.handleParseTotal(line);
    this.handleParseDetail(line);
  }

  /**
   * Build a new SummaryBuilder for a detail section
   *
   * @param rootDirectory option to pass to SummaryBuilder constructor
   * @returns SummaryBuilder
   *
   */
  protected getDetailSummaryBuilder(rootDirectory?: string): SummaryBuilder {
    return new SummaryBuilder(rootDirectory);
  }

  /**
   * Handle parsing data for total summary
   *
   * @param line data to parse
   *
   */
  protected handleParseTotal(line: string): void {
    this._totalBuilder.parse(line);
    if (this._totalBuilder.canBuild) {
      // Update builder to set path as "/" and name as "root" so all summaries can be combined properly
      this._totalBuilder.parse(`${InfoTypes.TestName}:root`);
      this._totalBuilder.parse(
        `${InfoTypes.SourceFile}:${this._rootDirectory}`,
      );

      const summary = this._totalBuilder.build();
      if (this._totalSummary) {
        this._totalSummary = this._totalSummary.combine(summary);
      } else {
        this._totalSummary = summary;
      }
      this._totalBuilder = new SummaryBuilder(this._rootDirectory);
    }
  }

  /**
   * Handle parsing data for current section
   *
   * @remarks
   * When the section has enough data, the Summary is built and a new
   * SummaryBuilder is created to handle parsing the next section. If
   * a Summary already exists for the given path, the new Summary is combined
   * with the existing Summary.
   *
   * @param line data to parse
   */
  protected handleParseDetail(line: string): void {
    this._detailBuilder.parse(line);
    if (this._detailBuilder.canBuild) {
      const detailSummary = this._detailBuilder.build();
      if (this._detailSummaries[detailSummary.path]) {
        this._detailSummaries[detailSummary.path] = this._detailSummaries[
          detailSummary.path
        ].combine(detailSummary);
      } else {
        this._paths.push(detailSummary.path);
        this._detailSummaries[detailSummary.path] = detailSummary;
      }
      this._detailBuilder = this.getDetailSummaryBuilder(this._rootDirectory);
    }
  }
}

export default ReportBuilder;
