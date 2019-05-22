import { InfoTypes, relative } from '../../utils';

import Record from '../records/record';
import Summary from '../summaries/summary';

/**
 * Summary Builder
 *
 * Build a Summary of a specific section by parsing a line of text that
 * matches the LCOV format.
 */
class SummaryBuilder {
  /**
   * File path of this section
   *
   * @hidden
   */
  protected _filePath: string = '';

  /**
   * Name of this section
   *
   * @hidden
   */
  protected _name: string = '';

  /**
   * Function hit count of this section
   *
   * @hidden
   */
  protected _functionHits: number = 0;

  /**
   * Function total count of this section
   *
   * @hidden
   */
  protected _functionTotal: number = 0;

  /**
   * Line hit count of this section
   *
   * @hidden
   */
  protected _lineHits: number = 0;

  /**
   * Line total count of this section
   *
   * @hidden
   */
  protected _lineTotal: number = 0;

  /**
   * Branch hit count of this section
   *
   * @hidden
   */
  protected _branchHits: number = 0;

  /**
   * Branch total count of this section
   *
   * @hidden
   */
  protected _branchTotal: number = 0;

  /**
   * Flag to tell if Summary can be created
   *
   * @hidden
   */
  protected _readyToBuild: boolean = false;

  /**
   * Root directory to relativize file name with
   *
   * @hidden
   */
  protected _rootDirectory: string = '';

  /**
   * Create a SummaryBuilder
   *
   * @param rootDirectory base path that the incoming file path should be
   *                      relativized with
   */
  constructor(rootDirectory: string = '') {
    this._rootDirectory = rootDirectory;
  }

  /**
   * Minimum set of data is created and Summary can be built
   *
   * @readonly
   */
  public get canBuild() {
    return this._readyToBuild;
  }

  /**
   * Build a Summary
   *
   * Use the parsed data to build a Summary. If requisite data has not been
   * provided yet, this method will throw an error.
   *
   * @returns Summary containing parsed data
   * @throws when builder has not received all data yet
   */
  public build(): Summary {
    if (!this._readyToBuild) {
      throw new Error('Unable to build: End of Record not reached');
    }
    const branchRecord = new Record(this._branchTotal, this._branchHits);
    const functionRecord = new Record(this._functionTotal, this._functionHits);
    const lineRecord = new Record(this._lineTotal, this._lineHits);
    return new Summary(
      this._filePath,
      this._name,
      branchRecord,
      functionRecord,
      lineRecord,
    );
  }

  /**
   * Parse a line of data
   *
   * Parse a line of data that matches the LCOV format. Parsing is only
   * supported for basic summary info, other data will be discarded.
   *
   * Invalid input will result in a no-op.
   *
   * @param line data to parse
   */
  public parse(line: string): void {
    if (!line.trim().length) {
      return;
    }
    const [type, ...contents] = line.trim().split(':');
    const content = contents.join(':');
    try {
      switch (type) {
        case InfoTypes.TestName: {
          this._name = content || this._name;
          break;
        }
        case InfoTypes.SourceFile: {
          this._filePath = relative(this._rootDirectory, content);
          // Insert a / instead of empty string for filepath
          if (this._filePath === '') {
            this._filePath = '/';
          }
          break;
        }
        case InfoTypes.FunctionFoundCount: {
          this._functionTotal = this._convertToInt(content);
          break;
        }
        case InfoTypes.FunctionHitCount: {
          this._functionHits = this._convertToInt(content);
          break;
        }
        case InfoTypes.LineFoundCount: {
          this._lineTotal = this._convertToInt(content);
          break;
        }
        case InfoTypes.LineHitCount: {
          this._lineHits = this._convertToInt(content);
          break;
        }
        case InfoTypes.BranchFoundCount: {
          this._branchTotal = this._convertToInt(content);
          break;
        }
        case InfoTypes.BranchHitCount: {
          this._branchHits = this._convertToInt(content);
          break;
        }
        case InfoTypes.EndSection: {
          this._readyToBuild = true;
          break;
        }
        default: {
          break;
        }
      }
    } catch (_) {
      // Catch error to fail gracefully
      // This should result in a no-op for all cases
    }
  }

  /**
   * Helper method to convert a string to a number
   *
   * @param s number in a string form to convert
   * @returns the parsed number
   * @throws when input is not a number
   */
  protected _convertToInt(s: string): number {
    const count = parseInt(s, 10);
    if (count !== count) {
      throw new Error('Invalid String');
    }
    return count;
  }
}

export default SummaryBuilder;
