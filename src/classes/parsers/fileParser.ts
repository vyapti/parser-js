import { ReportMode } from '../../utils';
import fs from '../../utils/fs';

import Report from '../reports/report';

import Parser from './parser';

/**
 * File Parser
 *
 * An extension of {@link Parser | Parser} that supports reading data from
 * files when generating reports.
 */
class FileParser extends Parser {
  /**
   * Construct a FileParser
   *
   * Performs a check to makes sure file system methods are supported before
   * continuing.
   */
  constructor() {
    super();
    if (!fs.readFile || !fs.readFileSync) {
      throw new Error('FileParser is not supported in this environment!');
    }
  }

  /**
   * Parse (Asynchronously)
   *
   * Parse an input with the given options and return a Promise of a Report.
   *
   * @param filePath path to file that contains data to parse
   * @param options Optional options to control how the report is generated:
   *   - encoding - the type of encoding of the input data
   *   - rootDirectory - base directory that all paths are relativized from
   *   - mode - The type of Report that should be built
   *
   * @returns Promise that resolves with a parsed Report
   */
  public async parse(
    filePath: string,
    options: {
      encoding?: string;
      rootDirectory?: string;
      mode?: ReportMode;
    } = {},
  ): Promise<Report> {
    const { encoding, rootDirectory, mode } = options;
    let stringContent: string = '';
    try {
      stringContent = await new Promise((resolve, reject) => {
        fs.readFile(filePath, { encoding }, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data.toString(encoding));
          }
        });
      });
    } catch (err) {
      throw err;
    }
    return this.parseContents(stringContent, rootDirectory, mode);
  }

  /**
   * Parse (Synchronously)
   *
   * Parse an input with the given options and return a Report.
   *
   * @param filePath path to file that contains data to parse
   * @param options Optional options to control how the report is generated:
   *   - encoding - the type of encoding of the input data
   *   - rootDirectory - base directory that all paths are relativized from
   *   - mode - The type of Report that should be built
   *
   * @returns Parsed Report
   */
  public parseSync(
    filePath: string,
    options: {
      encoding?: string;
      rootDirectory?: string;
      mode?: ReportMode;
    } = {},
  ): Report {
    const { encoding, rootDirectory, mode } = options;
    const content = fs.readFileSync(filePath, encoding);
    const stringContent = content.toString(encoding);
    return this.parseContents(stringContent, rootDirectory, mode);
  }
}

export default FileParser;
