import Cloneable from '../../interfaces/cloneable';
import Combinable from '../../interfaces/combinable';

import DetailedRecord from '../records/detailedRecord';

import Summary from './summary';

class DetailedSummary extends Summary
  implements Cloneable<DetailedSummary>, Combinable<DetailedSummary> {
  protected _branch: DetailedRecord;
  protected _function: DetailedRecord;
  protected _line: DetailedRecord;

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

  public get branch(): DetailedRecord {
    return this._branch;
  }

  public get function(): DetailedRecord {
    return this._function;
  }

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
