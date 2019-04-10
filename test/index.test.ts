import { assert } from 'chai';
import 'mocha';

import topLevel from '../src/index';

it('top level export should expose correct elements', () => {
  assert.isDefined(topLevel.ContentParser, 'Content Parser should be exposed');
  assert.isDefined(topLevel.FileParser, 'File Parser should be exposed');
  assert.isDefined(topLevel.ReportMode, 'Report Mode should be exposed');
  assert.isDefined(topLevel.StreamParser, 'Stream Parser should be exposed');
});
