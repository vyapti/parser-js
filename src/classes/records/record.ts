import Cloneable from '../../interfaces/cloneable';
import Combinable from '../../interfaces/combinable';

class Record implements Cloneable<Record>, Combinable<Record> {
  private _total: number = 0;
  private _hit: number = 0;
  private _miss: number = 0;

  constructor(total: number, hit: number, miss?: number) {
    this._total = total;
    this._hit = hit;
    this._miss = miss || total - hit;
  }

  public get total() {
    return this._total;
  }

  public get hit() {
    return this._hit;
  }

  public get miss() {
    return this._miss;
  }

  public combine(other: Record): Record {
    return new Record(this._total + other.total, this._hit + other.hit, this._miss + other.miss);
  }

  public clone(): Record {
    return new Record(this._total, this._hit, this._miss);
  }
}

export default Record;
