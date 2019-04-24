import { ReportMode } from '../../utils';

import FlatReportBuilder from '../builders/flatReportBuilder';
import ReportBuilder from '../builders/reportBuilder';
import TreeReportBuilder from '../builders/treeReportBuilder';
import Report from '../reports/report';

abstract class Parser {
  public abstract async parse(
    _: any,
    __: {
      encoding?: string;
      rootDirectory?: string;
      mode?: ReportMode;
    },
  ): Promise<Report>;

  public abstract parseSync(
    _: any,
    __: { encoding?: string; rootDirectory?: string },
  ): Report;

  protected createBuilder(
    rootDirectory?: string,
    mode: ReportMode = ReportMode.Simple,
  ): ReportBuilder {
    switch (mode) {
      case ReportMode.Detail: {
        return new FlatReportBuilder(rootDirectory);
      }
      case ReportMode.Tree: {
        return new TreeReportBuilder(rootDirectory);
      }
      default: {
        return new ReportBuilder(rootDirectory);
      }
    }
  }

  protected parseContents(
    contents: string,
    rootDirectory?: string,
    mode?: ReportMode,
  ): Report {
    const builder = this.createBuilder(rootDirectory, mode);
    contents.split('\n').forEach(line => {
      builder.parse(line.trim());
    });
    return builder.build();
  }
}

export default Parser;
