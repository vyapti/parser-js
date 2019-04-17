import * as fs from 'fs';

/**
 * This file is an extra layer to allow stubbed functions during testing.
 *
 * Due to how ts-node works when building tests, sinon is unable to correctly
 * stub the fs module. While a stubbed function works within the testing file,
 * something with ts-node prevents the stubbed function from being used in the
 * implementation -- the actual fs implementation is used instead.
 *
 * When stubbing files within the project, however, sinon works as expected. So
 * this empty wrapper has been added to allow sinon to stub properly, while stil
 * allowing the fs module functions to used when building/running the project.
 *
 * More research is needed to track down the underlying issue that prevents sinon
 * from stubbing the fs module properly, but this workaround can be used in the
 * meantime.
 */
export default fs;
