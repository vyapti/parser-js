import { ReportMode } from '../../utils';

import Report from '../reports/report';

import Parser from './parser';

abstract class StreamParser extends Parser {
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
