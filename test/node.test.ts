import { assert } from 'chai';
import 'mocha';

import topLevelNode from '../src/node';

it('top level node export should expose correct elements', () => {
  assert.isDefined(
    topLevelNode.ContentParser,
    'Content Parser should be exposed',
  );
  assert.isDefined(topLevelNode.FileParser, 'File Parser should be exposed');
  assert.isDefined(topLevelNode.ReportMode, 'Report Mode should be exposed');
  assert.isDefined(
    topLevelNode.StreamParser,
    'Stream Parser should be exposed',
  );
});
