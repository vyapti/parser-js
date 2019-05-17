import { Readable } from 'stream';

import { ReportMode } from '../../utils';
import LineTransformer from '../../utils/lineTransformer';

import Report from '../reports/report';

import StreamParser from './streamParser';

/**
 * Node Stream Parser
 *
 * An extension of {@link StreamParser | StreamParser} that supports
 * Node Streams as the input source for generating reports.
 */
class NodeStreamParser extends StreamParser {
  /**
   * Parse (Asynchronously)
   *
   * Parse an input with the given options and return a Promise of a Report.
   *
   * @param stream Readable stream of input data
   * @param options Optional options to control how the report is generated:
   *   - encoding - the type of encoding of the input data
   *   - rootDirectory - base directory that all paths are relativized from
   *   - mode - The type of Report that should be built
   *
   * @returns Promise that resolves with a parsed Report
   */
  public async parse(
    stream: Readable,
    options: {
      encoding?: string;
      rootDirectory?: string;
      mode?: ReportMode;
    } = {},
  ): Promise<Report> {
    const { encoding, rootDirectory, mode } = options;
    const builder = this.createBuilder(rootDirectory, mode);
    const transformed = new LineTransformer(encoding);
    stream.pipe(transformed);

    return new Promise((resolve, reject) => {
      transformed.on('data', chunk => {
        try {
          const line = chunk.toString();
          builder.parse(line);
        } catch (err) {
          transformed.removeAllListeners();
          transformed.end();
          reject(err);
        }
      });

      transformed.on('end', () => {
        try {
          const report = builder.build();
          transformed.removeAllListeners();
          resolve(report);
        } catch (err) {
          transformed.removeAllListeners();
          transformed.end();
          reject(err);
        }
      });

      transformed.on('error', err => {
        transformed.removeAllListeners();
        transformed.end();
        reject(err);
      });
    });
  }
}

export default NodeStreamParser;
