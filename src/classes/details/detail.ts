import { ICloneable, ICombinable } from '../../types';

/**
 * Coverage Detail Data
 *
 * A structured object to hold detailed coverage data for any piece of data
 * (e.g. Branches, Functions, Lines) that supports cloning and combining data.
 */
class Detail implements ICloneable<Detail>, ICombinable<Detail> {
  /**
   * Line Number
   *
   * The line number that this Detail is associated with
   *
   */
  protected _lineNumber: number = -1;

  /**
   * Execution Count
   *
   * The execution count of this Detail
   */
  protected _executionCount: number = -1;

  /**
   * Construct a Detail with the given data
   *
   * @param lineNumber     The line number associated with the detailed data
   * @param executionCount The number of times the given line was executed
   */
  constructor(lineNumber: number, executionCount: number) {
    this._lineNumber = lineNumber;
    this._executionCount = executionCount;
  }

  /**
   * Line Number
   *
   * @returns the line number associated with this Detail
   */
  public get lineNumber() {
    return this._lineNumber;
  }

  /**
   * Execution Count
   *
   * @returns the number of times this Detail's line was executed
   */
  public get executionCount() {
    return this._executionCount;
  }

  public combine(other: Detail): Detail {
    if (this._lineNumber !== other.lineNumber) {
      return this.clone();
    }
    return new Detail(
      this._lineNumber,
      this._executionCount + other.executionCount,
    );
  }

  public clone(): Detail {
    return new Detail(this._lineNumber, this._executionCount);
  }
}

export default Detail;
