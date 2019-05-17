/**
 * Cloneable Interface
 *
 * Represents an object that can be copied completely (i.e. no references to
 * data are shared between the original object and its clone)
 */
interface ICloneable<T> {
  /**
   * Clone the object
   *
   * Return a deep copy of the object that contains no shared references to the
   * original object.
   *
   * @returns An object that contains the same data
   */
  clone(): T;
}

/**
 * Combinable Interface
 *
 * Represents an object that can be combined/merged together with another
 * object of the same type. The new merged object should contain no shared
 * references to neither the current nor the incoming object.
 */
interface ICombinable<T> {
  /**
   * Combine with another object
   *
   * Combine/merge the data in this object with an incoming object. The new
   * merged object should contain no shared references.
   *
   * @param other The other object to merge with this object
   * @returns An object that contains merged data
   */
  combine(other: T): T;
}

export { ICloneable, ICombinable };
