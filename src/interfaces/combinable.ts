interface ICombinable<T> {
  combine(other: T): T;
}

export default ICombinable;
