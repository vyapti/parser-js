import { ReportMode } from '../../utils';

import Report from '../reports/report';

import StreamParser from './streamParser';

class BrowserStreamParser extends StreamParser {
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
              controller.close();
              return;
            }

            const newLines = (partial + decoder.decode(value)).split('\n');
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
