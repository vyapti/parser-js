import { ReportMode } from '../../utils';

import FlatReportBuilder from '../builders/flatReportBuilder';
import ReportBuilder from '../builders/reportBuilder';
import TreeReportBuilder from '../builders/treeReportBuilder';
import Report from '../reports/report';

class Parser {
  constructor() {
    if (new.target === Parser) {
      throw new TypeError(
        'Cannot construct instances of Abstract Parser directly!',
      );
    }
  }
  public async parse(
    _: string | ReadableStream,
    __: {
      encoding?: string;
      rootDirectory?: string;
      mode?: ReportMode;
    } = {},
  ): Promise<Report> {
    throw new Error('This should be implemented by subclasses');
  }

  public parseSync(
    _: string | ReadableStream,
    __: { encoding?: string; rootDirectory?: string } = {},
  ): Report {
    throw new Error('This should be implemented by subclasses');
  }

  protected createBuilder(rootDirectory?: string, mode: ReportMode = ReportMode.Simple): ReportBuilder {
    switch(mode) {
      case ReportMode.Detail: {
        return new FlatReportBuilder(rootDirectory);
        break;
      }
      case ReportMode.Tree: {
        return new TreeReportBuilder(rootDirectory);
        break;
      }
      default: {
        return new ReportBuilder(rootDirectory);
        break;
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
