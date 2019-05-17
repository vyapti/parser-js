import { ReportMode } from '../../utils';

import Report from '../reports/report';

import Parser from './parser';

/**
 * Content Parser
 *
 * An extension of {@link Parser | Parser} that supports reading data from
 * a string.
 */
class ContentParser extends Parser {
  /**
   * Parse (Asynchronously)
   *
   * Parse an input with the given options and return a Promise of a Report.
   *
   * @remarks
   * Since the input data of this Parser is a string variable, this method
   * proxies the synchronous method
   *
   * @param contents data that should be parsed
   * @param options Optional options to control how the report is generated:
   *   - encoding - the type of encoding of the input data
   *   - rootDirectory - base directory that all paths are relativized from
   *   - mode - The type of Report that should be built
   *
   * @returns Promise that resolves with a parsed Report
   */
  public async parse(
    contents: string,
    options: { rootDirectory?: string; mode?: ReportMode } = {},
  ): Promise<Report> {
    return this.parseSync(contents, options);
  }

  /**
   * Parse (Synchronously)
   *
   * Parse an input with the given options and return a Report.
   *
   * @param contents data that should be parsed
   * @param options Optional options to control how the report is generated:
   *   - encoding - the type of encoding of the input data
   *   - rootDirectory - base directory that all paths are relativized from
   *   - mode - The type of Report that should be built
   *
   * @returns Parsed Report
   */
  public parseSync(
    contents: string,
    options: { rootDirectory?: string; mode?: ReportMode } = {},
  ): Report {
    const { rootDirectory, mode } = options;
    return this.parseContents(contents, rootDirectory, mode);
  }
}

export default ContentParser;
