import Summary from '../summaries/summary';

/**
 * Coverage Report
 *
 * A structured object to hold Coverage information for a set of paths. This
 * includes an overall Summary for the set of paths as well as Summary objects
 * for each path.
 */
class Report {
  /**
   * Total Summary
   *
   * @hidden
   */
  protected _total: Summary;

  /**
   * List of tracked paths
   *
   * @hidden
   */
  protected _paths: string[];

  /**
   * Map of Summary objects, keyed by a path
   *
   * @hidden
   */
  protected _details: { [index: string]: Summary };

  /**
   * Construct a Report
   *
   * @param total   Summary of all paths
   * @param paths   List of tracked paths
   * @param details Map of Summary objects, keyed by a path string
   */
  constructor(
    total: Summary,
    paths: string[],
    details: { [index: string]: Summary },
  ) {
    this._total = total.clone();
    this._paths = paths.slice(0);
    this._details = {};
    Object.keys(details).forEach(key => {
      this._details[key] = details[key].clone();
    });
  }

  /**
   * Combined Summary of all paths
   *
   * @readonly
   */
  public get total(): Summary {
    return this._total;
  }

  /**
   * List of paths tracked
   *
   * @readonly
   */
  public get paths(): string[] {
    return this._paths;
  }

  /**
   * Map of Summary objects, keyed by a path string
   *
   * @readonly
   */
  public get details(): { [index: string]: Summary } {
    return this._details;
  }
}

export default Report;
