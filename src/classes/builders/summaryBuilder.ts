import { InfoTypes, relative } from '../../utils';

import Record from '../records/record';
import Summary from '../summaries/summary';

class SummaryBuilder {
  protected _filePath: string = '';
  protected _name: string = '';

  protected _functionHits: number = 0;
  protected _functionTotal: number = 0;

  protected _lineHits: number = 0;
  protected _lineTotal: number = 0;

  protected _branchHits: number = 0;
  protected _branchTotal: number = 0;

  protected _readyToBuild: boolean = false;
  protected _rootDirectory: string = '';

  constructor(rootDirectory: string = '') {
    this._rootDirectory = rootDirectory;
  }

  public get canBuild() {
    return this._readyToBuild;
  }

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

  public parse(line: string): void {
    if (!line.trim().length) {
      return;
    }
    const [type, ...contents] = line.split(':');
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

  protected _convertToInt(s: string): number {
    const count = parseInt(s, 10);
    if (count !== count) {
      throw new Error('Invalid String');
    }
    return count;
  }
}

export default SummaryBuilder;
