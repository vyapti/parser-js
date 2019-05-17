import { ReportMode } from '../../utils';

import FlatReportBuilder from '../builders/flatReportBuilder';
import ReportBuilder from '../builders/reportBuilder';
import TreeReportBuilder from '../builders/treeReportBuilder';
import Report from '../reports/report';

/**
 * Abstract Parser
 *
 * A shared base class for all variations of Parsers to share the same API.
 * Several utility helper methods are defined to help subclasses implement
 * the parse methods.
 */
abstract class Parser {
  /**
   * Parse (Asynchronously)
   *
   * Parse an input with the given options and return a Promise of a Report.
   *
   * @param input the input of data (determined by the subclass implementation)
   * @param options Optional options to control how the report is generated:
   *   - encoding - the type of encoding of the input data
   *   - rootDirectory - base directory that all paths are relativized from
   *   - mode - The type of Report that should be built
   *
   * @returns Promise that resolves with a parsed Report
   */
  public abstract async parse(
    _: any,
    __: {
      encoding?: string;
      rootDirectory?: string;
      mode?: ReportMode;
    },
  ): Promise<Report>;

  /**
   * Parse (Synchronously)
   *
   * Parse an input with the given options and return a Report.
   *
   * @param input the input of data (determined by the subclass implementation)
   * @param options Optional options to control how the report is generated:
   *   - encoding - the type of encoding of the input data
   *   - rootDirectory - base directory that all paths are relativized from
   *   - mode - The type of Report that should be built
   *
   * @returns Parsed Report
   */
  public abstract parseSync(
    _: any,
    __: {
      encoding?: string;
      rootDirectory?: string;
      mode?: ReportMode;
    },
  ): Report;

  /**
   * Create a ReportBuilder from the given options
   *
   * @param rootDirectory base directory that all paths are relativized from
   * @param mode The type of builder that should be created. Defaults to Simple
   *
   * @returns ReportBuilder
   */
  protected createBuilder(
    rootDirectory?: string,
    mode: ReportMode = ReportMode.Simple,
  ): ReportBuilder {
    switch (mode) {
      case ReportMode.Detail: {
        return new FlatReportBuilder(rootDirectory);
      }
      case ReportMode.Tree: {
        return new TreeReportBuilder(rootDirectory);
      }
      default: {
        return new ReportBuilder(rootDirectory);
      }
    }
  }

  /**
   * Parse the string contents and return a Report
   *
   * @param contents string containing input that should be parsed
   * @param rootDirectory base directory that all paths are relativized from
   * @param mode The type of builder that should be created
   *
   * @returns Parsed Report
   */
  protected parseContents(
    contents: string,
    rootDirectory?: string,
    mode?: ReportMode,
  ): Report {
    const builder = this.createBuilder(rootDirectory, mode);
    contents.split('\n').forEach(line => {
      builder.parse(line.trim());
    });
    return builder.build();
  }
}

export default Parser;
