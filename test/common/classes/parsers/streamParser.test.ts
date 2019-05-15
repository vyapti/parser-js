import { expect } from 'chai';

import StreamParser from '../../../../src/classes/parsers/streamParser';
import Report from '../../../../src/classes/reports/report';
import { ReportMode } from '../../../../src/utils';

class StreamParserTest extends StreamParser {
  public async parse(
    _: any,
    __: {
      encoding?: string;
      rootDirectory?: string;
      mode?: ReportMode;
    } = {},
  ): Promise<Report> {
    throw new Error('This is not implemented!');
  }
}

describe('StreamParser (Abstract)', () => {
  it('should throw an error for parseSync', () => {
    const sp: StreamParser = new StreamParserTest();
    expect(sp).to.be.an.instanceOf(StreamParser);
    expect(() => {
      sp.parseSync('something');
    }).to.throw(/not supported/);
    expect(() => {
      sp.parseSync('something', {
        encoding: 'buffer',
        mode: ReportMode.Simple,
        rootDirectory: '/root',
      });
    }).to.throw(/not supported/);
  });
});
