import DetailedSummary from '../summaries/detailedSummary';
import Summary from '../summaries/summary';

import Report from './report';

/**
 * Flat Coverage Report
 *
 * An extension of {@link Report | Report} that stores DetailedSummary objects
 * per path instead of regular Summary objects.
 */
class FlatReport extends Report {
  /**
   * Map of DetailedSummary objects, keyed by a path
   *
   * @hidden
   */
  protected _details: { [index: string]: DetailedSummary };

  /**
   * Construct a FlatReport
   *
   * @param total   Summary of all paths
   * @param paths   List of tracked paths
   * @param details Map of DetailedSummary objects, keyed by a path string
   */
  constructor(
    total: Summary,
    paths: string[],
    details: { [index: string]: DetailedSummary },
  ) {
    super(total, paths, details);
    this._details = {};
    Object.keys(details).forEach(key => {
      this._details[key] = details[key].clone();
    });
  }

  /**
   * Map of DetailedSummary objects, keyed by a path string
   *
   * @readonly
   */
  public get details(): { [index: string]: DetailedSummary } {
    return this._details;
  }
}

export default FlatReport;
