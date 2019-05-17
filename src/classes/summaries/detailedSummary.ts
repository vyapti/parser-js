import { ICloneable, ICombinable } from '../../types';

import DetailedRecord from '../records/detailedRecord';

import Summary from './summary';

/**
 * Detailed Coverage Summary Data
 *
 * A structured object to hold detailed coverage summary information for a
 * specific path. This includes DetailedRecords for branch, function, and line
 * data. Detailed summaries also support cloning and combining.
 */
class DetailedSummary extends Summary
  implements ICloneable<DetailedSummary>, ICombinable<DetailedSummary> {
  /**
   * Detailed Branch Record Data
   *
   * @hidden
   */
  protected _branch: DetailedRecord;

  /**
   * Detailed Function Record Data
   *
   * @hidden
   */
  protected _function: DetailedRecord;

  /**
   * Detailed Line Record Data
   *
   * @hidden
   */
  protected _line: DetailedRecord;

  /**
   * Construct a DetailedSummary
   *
   * @param path   path associated with summary data
   * @param name   name associated with summary data
   * @param branch DetailedRecord for branch data to store
   * @param func   DetailedRecord for function data to store
   * @param line   DetailedRecord for line data to store
   */
  constructor(
    path: string,
    name: string,
    branch: DetailedRecord,
    func: DetailedRecord,
    line: DetailedRecord,
  ) {
    super(path, name, branch, func, line);
    this._branch = branch;
    this._function = func;
    this._line = line;
  }

  /**
   * Branch DetailedRecord for this Summary
   *
   * @readonly
   */
  public get branch(): DetailedRecord {
    return this._branch;
  }

  /**
   * Function DetailedRecord for this Summary
   *
   * @readonly
   */
  public get function(): DetailedRecord {
    return this._function;
  }

  /**
   * Line DetailedRecord for this Summary
   *
   * @readonly
   */
  public get line(): DetailedRecord {
    return this._line;
  }

  public combine(other: DetailedSummary): DetailedSummary {
    if (this.name !== other.name || this.path !== other.path) {
      return this.clone();
    }
    return new DetailedSummary(
      this.path,
      this.name,
      this._branch.combine(other.branch),
      this._function.combine(other.function),
      this._line.combine(other.line),
    );
  }

  public clone(): DetailedSummary {
    return new DetailedSummary(
      this.path,
      this.name,
      this._branch.clone(),
      this._function.clone(),
      this._line.clone(),
    );
  }
}

export default DetailedSummary;
