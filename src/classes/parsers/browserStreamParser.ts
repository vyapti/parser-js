import { ReportMode } from '../../utils';

import Report from '../reports/report';

import StreamParser from './streamParser';

/**
 * Browser Stream Parser
 *
 * An extension of {@link StreamParser | StreamParser} that supports
 * Browser Streams as the input source for generating reports.
 */
class BrowserStreamParser extends StreamParser {
  /**
   * Parse (Asynchronously)
   *
   * Parse an input with the given options and return a Promise of a Report.
   *
   * @param stream ReadableStream of input data
   * @param options Optional options to control how the report is generated:
   *   - encoding - the type of encoding of the input data
   *   - rootDirectory - base directory that all paths are relativized from
   *   - mode - The type of Report that should be built
   *
   * @returns Promise that resolves with a parsed Report
   */
  public async parse(
    stream: ReadableStream,
    options: {
      encoding?: string;
      rootDirectory?: string;
      mode?: ReportMode;
    } = {},
  ): Promise<Report> {
    const { encoding, rootDirectory, mode } = options;
    const builder = this.createBuilder(rootDirectory, mode);
    const lineStream = this.createLineTransformer(stream, encoding);
    const lsReader = lineStream.getReader();
    const handleLine = async (): Promise<void> => {
      return lsReader.read().then(({ done, value }) => {
        if (done) {
          return;
        }
        builder.parse(value);
        return handleLine();
      });
    };
    await handleLine();
    return builder.build();
  }

  /**
   * Transfrom Stream from chunks of data to lines of data
   *
   * Decode incoming data from a ReadableStream and output the result
   * line-by-line to a new ReadableStream.
   *
   * @remarks
   * This method effectively acts as a Transform stream, but the Transform
   * Stream in the Browser Streams API is still experimental.
   *
   * @hidden
   */
  private createLineTransformer(
    stream: ReadableStream,
    encoding: string = 'utf-8',
  ): ReadableStream {
    const decoder = new TextDecoder(encoding);
    const reader = stream.getReader();
    return new ReadableStream({
      start(controller) {
        let partial = '';
        const push = async (): Promise<void> => {
          return reader.read().then(({ done, value }) => {
            if (done) {
              controller.enqueue(partial.trim());
              controller.close();
              return;
            }

            const newLines = (partial + decoder.decode(value))
              .trim()
              .split('\n');
            partial = newLines.pop() || '';
            newLines.forEach(line => {
              controller.enqueue(line.trim());
            });
            return push();
          });
        };

        push();
      },
    });
  }
}

export default BrowserStreamParser;
