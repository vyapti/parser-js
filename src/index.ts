import BrowserStreamParser from './classes/parsers/browserStreamParser';
import ContentParser from './classes/parsers/contentParser';
import FileParser from './classes/parsers/fileParser';
import NodeStreamParser from './classes/parsers/nodeStreamParser';
import { ReportMode } from './utils';

/**
 * StreamParser to export
 *
 * Export the NodeStreamParser if in a node environment, otherwise export
 * the Browser StreamParser
 *
 * @hidden
 */
let streamParser: any = BrowserStreamParser;
if (
  typeof process === 'object' &&
  typeof process.versions === 'object' &&
  process.versions.node !== undefined
) {
  streamParser = NodeStreamParser;
}

export { ContentParser, FileParser, ReportMode, streamParser as StreamParser };
