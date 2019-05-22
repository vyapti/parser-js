import { InfoTypes } from '../../utils';

import DetailedRecord from '../records/detailedRecord';
import DetailedSummary from '../summaries/detailedSummary';

import BranchDetail from '../details/branchDetail';
import Detail from '../details/detail';
import FunctionDetail from '../details/functionDetail';

import SummaryBuilder from './summaryBuilder';

/**
 * Detailed Summary Builder
 *
 * An extension of {@link SummaryBuilder | SummaryBuilder} that supports
 * parsing detailed data within the LCOV format.
 */
class DetailedSummaryBuilder extends SummaryBuilder {
  /**
   * Detailed Branch data
   *
   * @hidden
   */
  protected _branchDetails: BranchDetail[] = [];

  /**
   * Detailed Function data
   *
   * @hidden
   */
  protected _functionDetails: FunctionDetail[] = [];

  /**
   * Detailed Line data
   *
   * @hidden
   */
  protected _lineDetails: Detail[] = [];

  /**
   * Build a DetailedSummary
   *
   * Use the parsed data to build a DetailedSummary. If requisite data has not
   * been provided yet, this method will throw an error
   *
   * @returns DetailedSummary containing parsed data
   * @throws when builder has not received all data yet
   */
  public build(): DetailedSummary {
    if (!this._readyToBuild) {
      throw new Error('Unable to build: End of Record not reached');
    }
    const branchRecord = new DetailedRecord(
      this._branchTotal,
      this._branchHits,
      undefined,
      this._branchDetails,
    );
    const functionRecord = new DetailedRecord(
      this._functionTotal,
      this._functionHits,
      undefined,
      this._functionDetails,
    );
    const lineRecord = new DetailedRecord(
      this._lineTotal,
      this._lineHits,
      undefined,
      this._lineDetails,
    );
    return new DetailedSummary(
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
   * Parse a line of data that matches the LCOV format.
   *
   * Invalid input will result in a no-op.
   *
   * @param line data to parse
   */
  public parse(line: string): void {
    if (!line.trim().length) {
      return;
    }
    super.parse(line);
    const [type, ...contents] = line.trim().split(':');
    const content = contents.join(':');
    try {
      switch (type) {
        case InfoTypes.FunctionName: {
          const [lineStr, name] = content.split(',');
          const lineNo = this._convertToInt(lineStr);
          const existingIdx = this._functionDetails.findIndex(
            fd => fd.name === name,
          );
          if (existingIdx >= 0) {
            const { executionCount } = this._functionDetails[existingIdx];
            this._functionDetails[existingIdx] = new FunctionDetail(
              lineNo,
              executionCount,
              name,
            );
          } else {
            this._functionDetails.push(new FunctionDetail(lineNo, 0, name));
          }
          break;
        }
        case InfoTypes.FunctionNameCovered: {
          const [execStr, name] = content.split(',');
          const executionCount = this._convertToInt(execStr);
          const existingIdx = this._functionDetails.findIndex(
            fd => fd.name === name,
          );
          if (existingIdx >= 0) {
            const { lineNumber } = this._functionDetails[existingIdx];
            this._functionDetails[existingIdx] = new FunctionDetail(
              lineNumber,
              executionCount,
              name,
            );
          } else {
            this._functionDetails.push(
              new FunctionDetail(-1, executionCount, name),
            );
          }
          break;
        }
        case InfoTypes.CoveredLine: {
          const [lineStr, execStr] = content.split(',');
          const lineNo = this._convertToInt(lineStr);
          const execCount = this._convertToInt(execStr);
          const existingIdx = this._lineDetails.findIndex(
            d => d.lineNumber === lineNo,
          );
          if (existingIdx >= 0) {
            this._lineDetails[existingIdx] = new Detail(lineNo, execCount);
          } else {
            this._lineDetails.push(new Detail(lineNo, execCount));
          }
          break;
        }
        case InfoTypes.BranchCovered: {
          const [lineNo, blockNo, branchNo, execCount] = content
            .split(',')
            .map(this._convertToInt);
          const existingIdx = this._branchDetails.findIndex(
            bd => bd.lineNumber === lineNo && bd.blockNumber === blockNo,
          );
          if (existingIdx >= 0) {
            this._branchDetails[existingIdx].addBranchExecutionCount(
              branchNo,
              execCount,
            );
          } else {
            const newDetail = new BranchDetail(lineNo, blockNo);
            newDetail.addBranchExecutionCount(branchNo, execCount);
            this._branchDetails.push(newDetail);
          }
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
}

export default DetailedSummaryBuilder;
