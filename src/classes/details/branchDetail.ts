import { ICloneable, ICombinable } from '../../types';

import Detail from './detail';

/**
 * Branch Coverage Detail Data
 *
 * An extension of {@link Detail | Detail} to hold detailed coverage data for
 * branch statements.
 */
class BranchDetail extends Detail
  implements ICloneable<BranchDetail>, ICombinable<BranchDetail> {
  /**
   * The block number assigned to the branch
   *
   * @remarks
   * Branches have the possibility to span multiple lines, so tracking branches
   * by line number is not enough. A 0-indexed number is assigned to the branch
   * statement (called a block) to help identify the branch when it spans
   * multiple lines.
   *
   * @hidden
   */
  private _blockNumber: number = -1;

  /**
   * A map of branch execution counts. Each key represents a possible branch
   * path (using a 0-indexed number) and each value represents the execution
   * count for that branch path.
   *
   * @hidden
   */
  private _branches: { [index: number]: number } = {};

  /**
   * Construct a BranchDetail
   *
   * @param lineNumber  The line number associated with the detailed data
   * @param blockNumber The block number assigned to the branch
   */
  constructor(lineNumber: number, blockNumber: number) {
    super(lineNumber, 0);
    this._blockNumber = blockNumber;
  }

  /**
   * Add Branch Execution Data
   *
   * Adds an execution count for a specific branching path. If the branching
   * path already exists, the execution count is appended to the existing
   * value. Otherwise, a new entry is saved with the given execution count.
   *
   * The execution count is appended to the total execution count of this
   * BranchDetail as well.
   *
   * @param branchNumber   A 0-indexed identifier of the branch path
   * @param executionCount The execution count to add
   */
  public addBranchExecutionCount(
    branchNumber: number,
    executionCount: number,
  ): void {
    if (branchNumber < 0) {
      throw new Error('Illegal Argument: branchNumber must be >= 0');
    }
    if (executionCount < 0) {
      throw new Error('Illegal Argument: executionCount must be > 0');
    }
    if (!this._branches[branchNumber]) {
      this._branches[branchNumber] = executionCount;
    } else {
      this._branches[branchNumber] += executionCount;
    }
    this._executionCount += executionCount;
  }

  /**
   * Get the execution count of a specific branch path
   *
   * If the given branch number was not previously tracked, 0 will be returned.
   *
   * @param branchNumber A 0-indexed identifier of the branch path
   */
  public getBranchExecutionCount(branchNumber: number): number {
    return this._branches[branchNumber] || 0;
  }

  /**
   * Block Number
   *
   * @returns The block number assigned to this BranchDetail
   */
  public get blockNumber(): number {
    return this._blockNumber;
  }

  /**
   * Branches
   *
   * @returns the branch map containing execution counts for specific branch
   *          paths
   */
  public get branches(): { [index: number]: number } {
    return this._branches;
  }

  public combine(other: BranchDetail): BranchDetail {
    const cloned = this.clone();
    if (
      this._lineNumber === other.lineNumber &&
      this._blockNumber === other.blockNumber
    ) {
      Object.keys(other.branches)
        .map(str => parseInt(str, 10))
        .forEach((branchNo: number) => {
          cloned.addBranchExecutionCount(branchNo, other.branches[branchNo]);
        });
    }
    return cloned;
  }

  public clone(): BranchDetail {
    const bd = new BranchDetail(this._lineNumber, this._blockNumber);
    Object.keys(this._branches)
      .map(str => parseInt(str, 10))
      .forEach((branchNo: number) => {
        bd.addBranchExecutionCount(branchNo, this._branches[branchNo]);
      });
    return bd;
  }
}

export default BranchDetail;
