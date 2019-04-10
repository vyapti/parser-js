import { ReportMode } from '../../utils';

import Report from '../reports/report';

import Parser from './parser';

class ContentParser extends Parser {
  public async parse(
    contents: string,
    options: { rootDirectory?: string; mode?: ReportMode } = {},
  ): Promise<Report> {
    return this.parseSync(contents, options);
  }

  public parseSync(
    contents: string,
    options: { rootDirectory?: string; mode?: ReportMode } = {},
  ): Report {
    const { rootDirectory, mode } = options;
    return this.parseContents(contents, rootDirectory, mode);
  }
}

export default ContentParser;
