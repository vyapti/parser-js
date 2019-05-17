import { ReportMode } from '../../utils';

import Report from '../reports/report';

import Parser from './parser';

/**
 * Abstract Parser for Streams
 *
 * An extension of {@link Parser | Parser} that assumes parsing will be done
 * for a stream. Streams supported are Browser Streams (see the Streams API)
 * or Node Streams (see the Node Streams API).
 *
 * @remarks
 * Since streams are inherently asynchronous, the parseSync method does not
 * make sense as a function. This class implements the parseSync method and
 * throws an error so the subclass implementations don't have to implement
 * it.
 */
abstract class StreamParser extends Parser {
  /**
   *
   * @param input input stream
   * @param options Optional options to control how the report is generated:
   *   - encoding - the type of encoding of the input data
   *   - rootDirectory - base directory that all paths are relativized from
   *   - mode - The type of Report that should be built
   *
   * @throws Parsing streams synchronously is not supported
   */
  public parseSync(
    _: any,
    __: {
      encoding?: string;
      rootDirectory?: string;
      mode?: ReportMode;
    } = {},
  ): Report {
    throw new Error('Synchronous parsing with streams is not supported!');
  }
}

export default StreamParser;
