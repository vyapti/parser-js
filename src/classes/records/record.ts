import { ICloneable, ICombinable } from '../../types';

/**
 * Coverage Record Data
 *
 * A structured object to hold coverage counts for any piece of data
 * (e.g. Branches, Functions, Lines) that also supports combining data and
 * cloning data.
 */
class Record implements ICloneable<Record>, ICombinable<Record> {
  /**
   * Total count
   *
   * @ignore
   */
  private _total: number = 0;

  /**
   * Hit count
   *
   * @ignore
   */
  private _hit: number = 0;

  /**
   * Miss count
   *
   * @ignore
   */
  private _miss: number = 0;

  /**
   * Construct a Record with the given data
   *
   * @param total the total count
   * @param hit   the hit count
   * @param miss  the miss count (optional: will be calculated from
   *              total and hit if not provided)
   */
  constructor(total: number, hit: number, miss?: number) {
    this._total = total;
    this._hit = hit;
    this._miss = miss || total - hit;
  }

  /**
   * Total Count
   *
   * @readonly
   */
  public get total() {
    return this._total;
  }

  /**
   * Hit Count
   *
   * @readonly
   */
  public get hit() {
    return this._hit;
  }

  /**
   * Miss Count
   *
   * @readonly
   */
  public get miss() {
    return this._miss;
  }

  public combine(other: Record): Record {
    return new Record(
      this._total + other.total,
      this._hit + other.hit,
      this._miss + other.miss,
    );
  }

  public clone(): Record {
    return new Record(this._total, this._hit, this._miss);
  }
}

export default Record;
