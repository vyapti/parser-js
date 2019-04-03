import * as fs from 'fs';

import { ReportMode } from '../../utils';

import Report from '../reports/report';

import Parser from './parser';

class FileParser extends Parser {
  constructor() {
    super();
    if (!fs.readFile || !fs.readFileSync) {
      throw new Error('FileParser is not supported in this environment!');
    }
  }

  public async parse(
    filePath: string,
    options: {
      encoding?: string;
      rootDirectory?: string;
      mode?: ReportMode;
    } = {},
  ): Promise<Report> {
    const { encoding, rootDirectory, mode } = options;
    const stringContent: string = await new Promise((resolve, reject) => {
      fs.readFile(filePath, { encoding }, (err, data) => {
        if (err) {
          reject(err.message);
        } else {
          resolve(data.toString(encoding));
        }
      });
    });
    return this.parseContents(stringContent, rootDirectory, mode);
  }

  public parseSync(
    filePath: string,
    options: {
      encoding?: string;
      rootDirectory?: string;
      mode?: ReportMode;
    } = {},
  ): Report {
    const { encoding, rootDirectory, mode } = options;
    const content = fs.readFileSync(filePath, encoding);
    const stringContent = content.toString(encoding);
    return this.parseContents(stringContent, rootDirectory, mode);
  }
}

export default FileParser;
