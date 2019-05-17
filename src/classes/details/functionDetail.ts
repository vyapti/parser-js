import { ICloneable, ICombinable } from '../../types';

import Detail from './detail';

/**
 * Function Coverage Detail Data
 *
 * An extension of {@link Detail | Detail} to hold detailed coverage data for
 * function statements.
 */
class FunctionDetail extends Detail
  implements ICloneable<FunctionDetail>, ICombinable<FunctionDetail> {
  /**
   * The name of the function
   *
   * @ignore
   */
  private _name: string = '(anonymous)';

  /**
   * Construct a FunctionDetail
   *
   * @param lineNumber     The line number associated with the detailed data
   * @param executionCount The execution count of the associated function
   * @param name           The name of the associated function
   */
  constructor(lineNumber: number, executionCount: number, name: string) {
    super(lineNumber, executionCount);
    this._name = name;
  }

  /**
   * Name
   *
   * @returns the name of the associated function
   */
  public get name(): string {
    return this._name;
  }

  public combine(other: FunctionDetail): FunctionDetail {
    if (this._lineNumber === other.lineNumber && this._name === other.name) {
      return new FunctionDetail(
        this._lineNumber,
        this._executionCount + other.executionCount,
        this._name,
      );
    }
    return this.clone();
  }

  public clone(): FunctionDetail {
    return new FunctionDetail(
      this._lineNumber,
      this._executionCount,
      this._name,
    );
  }
}

export default FunctionDetail;
