import { ICloneable, ICombinable } from '../../types';

import Record from '../records/record';

/**
 * Coverage Summary
 *
 * A structured object to hold coverage summary information for a specific
 * path. This includes Records for branch, function and line data. Coverage
 * Summaries also support cloning and combining data.
 */
class Summary implements ICloneable<Summary>, ICombinable<Summary> {
  /**
   * Branch Record Data
   *
   * @hidden
   */
  protected _branch: Record;

  /**
   * Function Record Data
   *
   * @hidden
   */
  protected _function: Record;

  /**
   * Line Record Data
   *
   * @hidden
   */
  protected _line: Record;

  /**
   * Name of summary
   *
   * @hidden
   */
  protected _name: string = '';

  /**
   * Path associated with summary
   *
   * @hidden
   */
  protected _path: string = '';

  /**
   * Construct a Summary
   *
   * @param path   path associated with summary data
   * @param name   name associated with summary data
   * @param branch Record for branch data to store
   * @param func   Record for function data to store
   * @param line   Record for line data to store
   */
  constructor(
    path: string,
    name: string,
    branch: Record,
    func: Record,
    line: Record,
  ) {
    this._name = name;
    this._path = path;
    this._branch = branch.clone();
    this._function = func.clone();
    this._line = line.clone();
  }

  /**
   * Name associated with this Summary
   *
   * @readonly
   */
  public get name() {
    return this._name;
  }

  /**
   * Path associated with this Summary
   *
   * @readonly
   */
  public get path() {
    return this._path;
  }

  /**
   * Branch Record data for this Summary
   *
   * @readonly
   */
  public get branch() {
    return this._branch;
  }

  /**
   * Function Record data for this Summary
   *
   * @readonly
   */
  public get function() {
    return this._function;
  }

  /**
   * Line Record data for this Summary
   *
   * @readonly
   */
  public get line() {
    return this._line;
  }

  public combine(other: Summary): Summary {
    if (this._name !== other.name || this._path !== other.path) {
      return this.clone();
    }
    return new Summary(
      this._path,
      this._name,
      this._branch.combine(other.branch),
      this._function.combine(other.function),
      this._line.combine(other.line),
    );
  }

  public clone(): Summary {
    return new Summary(
      this._path,
      this._name,
      this._branch.clone(),
      this._function.clone(),
      this._line.clone(),
    );
  }
}

export default Summary;
