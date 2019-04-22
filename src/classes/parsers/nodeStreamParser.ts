import { Readable } from 'stream';

import { ReportMode } from '../../utils';
import LineTransformer from '../../utils/lineTransformer';

import Report from '../reports/report';

import StreamParser from './streamParser';

class NodeStreamParser extends StreamParser {
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
        const line = chunk.toString();
        builder.parse(line);
      });

      transformed.on('end', () => {
        const report = builder.build();
        transformed.removeAllListeners();
        resolve(report);
      });

      transformed.on('error', err => {
        reject(err);
        transformed.removeAllListeners();
        transformed.end();
      });
    });
  }
}

export default NodeStreamParser;
