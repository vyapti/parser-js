import { InfoTypes } from '../../utils';

import Report from '../reports/report';
import Summary from '../summaries/summary';

import SummaryBuilder from './summaryBuilder';

class ReportBuilder {
  protected _totalBuilder: SummaryBuilder = new SummaryBuilder();
  protected _totalSummary?: Summary;

  protected _detailBuilder: SummaryBuilder = new SummaryBuilder();
  protected _detailSummaries: { [index: string]: Summary } = {};

  protected _paths: string[] = [];

  protected _rootDirectory: string = '';

  constructor(rootDirectory: string = '') {
    this._rootDirectory = rootDirectory;
    this._totalBuilder = new SummaryBuilder(rootDirectory);
    this._detailBuilder = this.getDetailSummaryBuilder(rootDirectory);
  }

  public build(): Report {
    if (!this._totalSummary) {
      throw new Error('Unable to build report: Not enough data!');
    }
    return new Report(this._totalSummary, this._paths, this._detailSummaries);
  }

  public parse(line: string): void {
    if (!line.trim().length) {
      return;
    }

    this.handleParseTotal(line);
    this.handleParseDetail(line);
  }

  protected getDetailSummaryBuilder(rootDirectory?: string): SummaryBuilder {
    return new SummaryBuilder(rootDirectory);
  }

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
