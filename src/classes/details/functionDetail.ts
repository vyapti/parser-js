import { ICloneable, ICombinable } from '../../types';

import Detail from './detail';

class FunctionDetail extends Detail
  implements ICloneable<FunctionDetail>, ICombinable<FunctionDetail> {
  private _name: string = '(anonymous)';

  constructor(lineNumber: number, executionCount: number, name: string) {
    super(lineNumber, executionCount);
    this._name = name;
  }

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
