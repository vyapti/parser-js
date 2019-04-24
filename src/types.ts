interface ICloneable<T> {
  clone(): T;
}

interface ICombinable<T> {
  combine(other: T): T;
}

export { ICloneable, ICombinable };
