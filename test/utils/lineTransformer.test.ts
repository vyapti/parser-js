import chai, { assert, expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { PassThrough, Transform } from 'stream';

import LineTransformer from '../../src/utils/lineTransformer';

chai.use(sinonChai);

describe('LineTransformer', () => {
  it('should contruct properly', () => {
    const lt = new LineTransformer();
    expect(lt).to.be.an.instanceOf(Transform);
    expect(lt).to.be.an.instanceOf(LineTransformer);
  });

  it('should transform stream into lines', async () => {
    const stub = sinon.stub();
    const passThrough = new PassThrough();
    const lt = new LineTransformer();
    passThrough.pipe(lt);
    lt.on('data', chunk => {
      stub(chunk.toString());
    });
    const endPromise = new Promise(resolve => {
      lt.on('end', resolve);
    });

    passThrough.write(Buffer.from('testing', 'utf-8'));
    passThrough.write(Buffer.from(' on the sameline', 'utf-8'));
    passThrough.write(
      Buffer.from('\nnow\nthere\nare\ndifferent\nlines\n', 'utf-8'),
    );
    passThrough.write(
      Buffer.from(
        '\n\nempty lines are skipped\nlast part should get flushed on end',
        'utf-8',
      ),
    );
    passThrough.end();

    await endPromise;

    expect(stub.callCount).to.equal(8);
  });

  it('should transform stream into lines for specified encoding', async () => {
    const stub = sinon.stub();
    const passThrough = new PassThrough();
    const lt = new LineTransformer('ascii');
    passThrough.pipe(lt);
    lt.on('data', chunk => {
      stub(chunk.toString());
    });
    const endPromise = new Promise(resolve => {
      lt.on('end', resolve);
    });

    passThrough.write(Buffer.from('testing', 'ascii'));
    passThrough.write(Buffer.from(' on the sameline', 'ascii'));
    passThrough.write(
      Buffer.from('\nnow\nthere\nare\ndifferent\nlines\n', 'ascii'),
    );
    passThrough.write(
      Buffer.from(
        '\n\nempty lines are skipped\nlast part should get flushed on end',
        'ascii',
      ),
    );
    passThrough.end();

    await endPromise;

    expect(stub.callCount).to.equal(8);
  });

  it('should use specific encoding if passed through', async () => {
    const stub = sinon.stub();
    const passThrough = new PassThrough();
    const lt = new LineTransformer();
    passThrough.pipe(lt);
    lt.on('data', chunk => {
      stub(chunk.toString());
    });
    const endPromise = new Promise(resolve => {
      lt.on('end', resolve);
    });

    passThrough.write(Buffer.from('testing'), 'utf-8');
    passThrough.write(' on the sameline');
    passThrough.write(
      Buffer.from('\nnow\nthere\nare\ndifferent\nlines\n', 'ascii'),
      'ascii',
    );
    passThrough.write(
      Buffer.from(
        '\n\nempty lines are skipped\nlast part should get flushed on end',
        'utf-8',
      ),
    );
    passThrough.end();

    await endPromise;

    expect(stub.callCount).to.equal(8);
  });

  it('should error out when encoding is wrong', async () => {
    const passThrough = new PassThrough();
    const lt = new LineTransformer('buffer');
    passThrough.pipe(lt);

    const errorPromise = new Promise(resolve => {
      lt.on('error', resolve);
    });

    passThrough.write('testing');

    await errorPromise;

    passThrough.end();
  });

  it('should end when incoming stream ends', async () => {
    const stub = sinon.stub();
    const passThrough = new PassThrough();
    const lt = new LineTransformer();
    passThrough.pipe(lt);
    lt.on('data', chunk => {
      stub(chunk.toString());
    });
    const endPromise = new Promise(resolve => {
      lt.on('end', resolve);
    });

    passThrough.end();

    await endPromise;

    assert.isFalse(stub.called);
  });
});
