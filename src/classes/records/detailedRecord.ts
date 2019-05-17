import { ICloneable, ICombinable } from '../../types';

import Detail from '../details/detail';

import Record from './record';

/**
 * Detailed Coverage Record Data
 *
 * A stuctured object to hold coverage counts for any piece of data
 * (e.g. Branches, Functions, Lines) that also supports detailed data
 * on the coverage counts (see @{link Detail | Detail} for more info).
 *
 * This class also supports combining and cloning data.
 */
class DetailedRecord extends Record
  implements ICloneable<DetailedRecord>, ICombinable<DetailedRecord> {
  /**
   * Detailed Data Map
   *
   * A Map keyed by the line number containing the details for that line
   *
   * @hidden
   */
  private _details: { [index: number]: Detail } = {};

  /**
   * Construct a DetailedRecord with the given data
   *
   * @param total          the total count
   * @param hit            the hit count
   * @param miss           the miss count (optional: will be calculated from
   *                       total and hit if not provided)
   * @param initialDetails the initial detail map to be associated with
   *                       the DetailedRecord
   */
  constructor(
    total: number,
    hit: number,
    miss?: number,
    initialDetails?: { [index: number]: Detail },
  ) {
    super(total, hit, miss);
    if (initialDetails) {
      Object.values(initialDetails).forEach((d: Detail) => {
        this._details[d.lineNumber] = d.clone();
      });
    }
  }

  /**
   * Add a Detail
   *
   * Clones the incoming detail and adds it to the stored details. If a detail
   * already exists for the line number, the incoming detail will be combined
   * with the existing detail.
   *
   * @param detail the detail to add
   */
  public addDetail(detail: Detail) {
    if (this._details[detail.lineNumber]) {
      this._details[detail.lineNumber] = this._details[
        detail.lineNumber
      ].combine(detail);
    } else {
      this._details[detail.lineNumber] = detail.clone();
    }
  }

  /**
   * Details stored in this DetailedRecord
   *
   * @returns detail map
   */
  public get details() {
    return this._details;
  }

  public combine(other: DetailedRecord): DetailedRecord {
    const cr = super.combine(other);
    const combined = this.combineDetails(other.details);
    return new DetailedRecord(cr.total, cr.hit, cr.miss, combined);
  }

  public clone(): DetailedRecord {
    return new DetailedRecord(this.total, this.hit, this.miss, this._details);
  }

  /**
   * Combine details
   *
   * Combine the current detail map with an incoming detail map. If details
   * exist in both maps, they will be combined, otherwise the data will be
   * cloned.
   *
   * This is a helper method to the combine methods.
   */
  protected combineDetails(otherDetails: {
    [index: number]: Detail;
  }): { [index: number]: Detail } {
    const combined: { [index: number]: Detail } = {};
    Object.values(this._details).forEach(
      (d: Detail) => (combined[d.lineNumber] = d.clone()),
    );
    Object.values(otherDetails).forEach((d: Detail) => {
      if (combined[d.lineNumber]) {
        combined[d.lineNumber] = combined[d.lineNumber].combine(d);
      } else {
        combined[d.lineNumber] = d.clone();
      }
    });
    return combined;
  }
}

export default DetailedRecord;
