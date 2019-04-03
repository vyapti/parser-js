import Cloneable from '../../interfaces/cloneable';
import Combinable from '../../interfaces/combinable';

import Detail from './detail';

class BranchDetail extends Detail implements Cloneable<BranchDetail>, Combinable<BranchDetail> {
  private _blockNumber: number = -1;
  private _branches: { [index: number]: number } = {};

  constructor(lineNumber: number, blockNumber: number) {
    super(lineNumber, 0);
    this._blockNumber = blockNumber;
  }

  public addBranchExecutionCount(branchNumber: number, executionCount: number) : void {
    if (branchNumber < 0) {
      throw new Error('Illegal Argument: branchNumber must be >= 0')
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

  public getBranchExecutionCount(branchNumber: number): number {
    return this._branches[branchNumber] || 0;
  }

  public get blockNumber(): number {
    return this._blockNumber;
  }

  public get branches(): { [index: number]: number } {
    return this._branches;
  }

  public combine(other: BranchDetail): BranchDetail {
    const cloned = this.clone();
    if (this._lineNumber === other.lineNumber && this._blockNumber === other.blockNumber) {
      Object.keys(other.branches).map(str => parseInt(str, 10)).forEach((branchNo: number) => {
        cloned.addBranchExecutionCount(branchNo, other.branches[branchNo]);
      });
    }
    return cloned;
  }

  public clone(): BranchDetail {
    const bd = new BranchDetail(this._lineNumber, this._blockNumber);
    Object.keys(this._branches).map(str => parseInt(str, 10)).forEach((branchNo: number) => {
      bd.addBranchExecutionCount(branchNo, this._branches[branchNo]);
    });
    return bd;
  }
}

export default BranchDetail;
