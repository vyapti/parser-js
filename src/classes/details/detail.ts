import Cloneable from '../../interfaces/cloneable';
import Combinable from '../../interfaces/combinable';

class Detail implements Cloneable<Detail>, Combinable<Detail> {
  protected _lineNumber: number = -1;
  protected _executionCount: number = -1;

  constructor(lineNumber: number, executionCount: number) {
    this._lineNumber = lineNumber;
    this._executionCount = executionCount;
  }

  public get lineNumber() {
    return this._lineNumber;
  }

  public get executionCount() {
    return this._executionCount;
  }

  public combine(other: Detail): Detail {
    if (this._lineNumber !== other.lineNumber) {
      return this.clone();
    }
    return new Detail(this._lineNumber, this._executionCount + other.executionCount);
  }

  public clone(): Detail {
    return new Detail(this._lineNumber, this._executionCount);
  }
}

export default Detail;
