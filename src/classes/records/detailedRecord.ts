import Cloneable from '../../interfaces/cloneable';
import Combinable from '../../interfaces/combinable';

import Detail from '../details/detail';

import Record from './record';

class DetailedRecord extends Record implements Cloneable<DetailedRecord>, Combinable<DetailedRecord> {
  private _details: { [index: number]: Detail } = {};

  constructor(total: number, hit: number, miss?: number, initialDetails?: { [index: number]: Detail }) {
    super(total, hit, miss);
    if (initialDetails) {
      Object.values(initialDetails).forEach((d: Detail) => {
        this._details[d.lineNumber] = d.clone();
      });
    }
  }

  public addDetail(detail: Detail) {
    if (this._details[detail.lineNumber]) {
      this._details[detail.lineNumber] = this._details[detail.lineNumber].combine(detail);
    } else {
      this._details[detail.lineNumber] = detail.clone();
    }
  }

  public get details() {
    return this._details;
  }

  public combine(other: DetailedRecord): DetailedRecord {
    const cr = super.combine(other);
    const cdr = new DetailedRecord(cr.total, cr.hit, cr.miss, this._details);
    cdr.combineDetails(other.details);
    return cdr;
  }

  public clone(): DetailedRecord {
    return new DetailedRecord(this.total, this.hit, this.miss, this._details);
  }

  protected combineDetails(otherDetails: { [index: number]: Detail }): { [index: number]: Detail } {
    const combined: { [index: number]: Detail } = {};
    Object.values(this._details).forEach((d: Detail) => combined[d.lineNumber] = d.clone());
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
