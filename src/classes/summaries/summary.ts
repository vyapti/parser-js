import Cloneable from '../../interfaces/cloneable';
import Combinable from '../../interfaces/combinable';

import Record from '../records/record';

class Summary implements Cloneable<Summary>, Combinable<Summary> {
  protected _branch: Record;
  protected _function: Record;
  protected _line: Record;

  protected _name: string = '';
  protected _path: string = '';

  constructor(
    path: string,
    name: string,
    branch: Record,
    func: Record,
    line: Record,
  ) {
    this._name = name;
    this._path = path;
    this._branch = branch;
    this._function = func;
    this._line = line;
  }

  public get name() {
    return this._name;
  }

  public get path() {
    return this._path;
  }

  public get branch() {
    return this._branch;
  }

  public get function() {
    return this._function;
  }

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
