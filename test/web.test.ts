import { assert } from 'chai';
import 'mocha';

import topLevelWeb from '../src/web';

it('top level web export should expose correct elements', () => {
  assert.isDefined(
    topLevelWeb.ContentParser,
    'Content Parser should be exposed',
  );
  assert.isDefined(topLevelWeb.ReportMode, 'Report Mode should be exposed');
  assert.isDefined(topLevelWeb.StreamParser, 'Stream Parser should be exposed');
});
