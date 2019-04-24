import chai, { assert, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mocha';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { PassThrough } from 'stream';

import NodeStreamParser from '../../../src/classes/parsers/nodeStreamParser';
import FlatReport from '../../../src/classes/reports/flatReport';
import Report from '../../../src/classes/reports/report';
import TreeReport from '../../../src/classes/reports/treeReport';
import { ReportMode } from '../../../src/utils';
import LineTransformer from '../../../src/utils/lineTransformer';

import { parserTesting } from './contentParser.test';
chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('NodeStreamParser', () => {
  let sandbox: sinon.SinonSandbox;
  let parser: NodeStreamParser;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should construct properly', () => {
    parser = new NodeStreamParser();
    expect(parser).to.be.an.instanceOf(NodeStreamParser);
    assert.isDefined(parser.parse);
    assert.isDefined(parser.parseSync);
  });

  describe('parse', () => {
    let passThrough: PassThrough;
    let originalCreateBuilder: (...args: any[]) => any;
    let parserCreateBuilderStub: sinon.SinonStub;
    let builderParseSpy: sinon.SinonSpy;
    let builderBuildSpy: sinon.SinonSpy;

    beforeEach(() => {
      passThrough = new PassThrough();
      parser = new NodeStreamParser();
      // Disable lint since we can only access protected method "createBuilder" this way
      // tslint:disable-next-line:no-string-literal
      originalCreateBuilder = parser['createBuilder'];
      // Using ""'createBuilder' as any" allows us to stub the protected method
      // NOTE: this is potentially subject to breakages if we move away from 'createBuilder'
      // in future versions of the Parser interface.
      parserCreateBuilderStub = sandbox
        .stub(parser, 'createBuilder' as any)
        .callsFake((rootDirectory, mode) => {
          const builder = originalCreateBuilder(
            rootDirectory as string,
            mode as ReportMode,
          );
          builderParseSpy = sandbox.spy(builder, 'parse');
          builderBuildSpy = sandbox.spy(builder, 'build');
          return builder;
        });
    });

    describe('when passing root directory', () => {
      const validateBasicReport = (report: Report) => {
        parserTesting.validateTotalSummary(report);
        parserTesting.validatePath(report, 'test');
        parserTesting.validateBasicSummary(report, 'test');
      };

      const validateDetailReport = (report: Report) => {
        validateBasicReport(report);
        parserTesting.validateDetailSummary(report as FlatReport, 'test');
      };

      it('should parse stream into a Report by default', async () => {
        const parsePromise = parser.parse(passThrough, {
          rootDirectory: '/root',
        });
        passThrough.write(parserTesting.parserContents);
        passThrough.end();
        const report = await parsePromise;
        expect(report).to.be.an.instanceOf(Report);
        validateBasicReport(report);
        expect(parserCreateBuilderStub.callCount).to.equal(1);
        expect(parserCreateBuilderStub).calledWith('/root', undefined);
        expect(builderParseSpy.callCount).to.equal(25);
        assert.isTrue(builderBuildSpy.calledOnce);
      });

      it('should parse stream into a Report when using Simple Report Mode', async () => {
        const parsePromise = parser.parse(passThrough, {
          mode: ReportMode.Simple,
          rootDirectory: '/root',
        });
        passThrough.write(parserTesting.parserContents);
        passThrough.end();
        const report = await parsePromise;
        expect(report).to.be.an.instanceOf(Report);
        validateBasicReport(report);
        expect(parserCreateBuilderStub.callCount).to.equal(1);
        expect(parserCreateBuilderStub).calledWith('/root', ReportMode.Simple);
        expect(builderParseSpy.callCount).to.equal(25);
        assert.isTrue(builderBuildSpy.calledOnce);
      });

      it('should parse stream into a FlatReport when using Detail Report Mode', async () => {
        const parsePromise = parser.parse(passThrough, {
          mode: ReportMode.Detail,
          rootDirectory: '/root',
        });
        passThrough.write(parserTesting.parserContents);
        passThrough.end();
        const report = await parsePromise;
        expect(report).to.be.an.instanceOf(FlatReport);
        validateDetailReport(report);
        expect(parserCreateBuilderStub.callCount).to.equal(1);
        expect(parserCreateBuilderStub).calledWith('/root', ReportMode.Detail);
        expect(builderParseSpy.callCount).to.equal(25);
        assert.isTrue(builderBuildSpy.calledOnce);
      });

      it('should parse stream into a TreeReport when using Tree Report Mode', async () => {
        const parsePromise = parser.parse(passThrough, {
          mode: ReportMode.Tree,
          rootDirectory: '/root',
        });
        passThrough.write(parserTesting.parserContents);
        passThrough.end();
        const report = await parsePromise;
        expect(report).to.be.an.instanceOf(TreeReport);
        validateDetailReport(report);
        expect(parserCreateBuilderStub.callCount).to.equal(1);
        expect(parserCreateBuilderStub).calledWith('/root', ReportMode.Tree);
        expect(builderParseSpy.callCount).to.equal(25);
        assert.isTrue(builderBuildSpy.calledOnce);
      });
    });

    describe('when not passing root directory', () => {
      const validateBasicReport = (report: Report) => {
        parserTesting.validateTotalSummary(report);
        parserTesting.validatePath(report, '/root/test');
        parserTesting.validateBasicSummary(report, '/root/test');
      };

      const validateDetailReport = (report: Report) => {
        validateBasicReport(report);
        parserTesting.validateDetailSummary(report as FlatReport, '/root/test');
      };

      it('should parse stream into a Report by default', async () => {
        const parsePromise = parser.parse(passThrough);
        passThrough.write(parserTesting.parserContents);
        passThrough.end();
        const report = await parsePromise;
        expect(report).to.be.an.instanceOf(Report);
        validateBasicReport(report);
        expect(parserCreateBuilderStub.callCount).to.equal(1);
        expect(parserCreateBuilderStub).calledWith(undefined, undefined);
        expect(builderParseSpy.callCount).to.equal(25);
        assert.isTrue(builderBuildSpy.calledOnce);
      });

      it('should parse stream into a Report when using Simple Report Mode', async () => {
        const parsePromise = parser.parse(passThrough, {
          mode: ReportMode.Simple,
        });
        passThrough.write(parserTesting.parserContents);
        passThrough.end();
        const report = await parsePromise;
        expect(report).to.be.an.instanceOf(Report);
        validateBasicReport(report);
        expect(parserCreateBuilderStub.callCount).to.equal(1);
        expect(parserCreateBuilderStub).calledWith(
          undefined,
          ReportMode.Simple,
        );
        expect(builderParseSpy.callCount).to.equal(25);
        assert.isTrue(builderBuildSpy.calledOnce);
      });

      it('should parse stream into a FlatReport when using Detail Report Mode', async () => {
        const parsePromise = parser.parse(passThrough, {
          mode: ReportMode.Detail,
        });
        passThrough.write(parserTesting.parserContents);
        passThrough.end();
        const report = await parsePromise;
        expect(report).to.be.an.instanceOf(FlatReport);
        validateDetailReport(report);
        expect(parserCreateBuilderStub.callCount).to.equal(1);
        expect(parserCreateBuilderStub).calledWith(
          undefined,
          ReportMode.Detail,
        );
        expect(builderParseSpy.callCount).to.equal(25);
        assert.isTrue(builderBuildSpy.calledOnce);
      });

      it('should parse stream into a TreeReport when using Tree Report Mode', async () => {
        const parsePromise = parser.parse(passThrough, {
          mode: ReportMode.Tree,
        });
        passThrough.write(parserTesting.parserContents);
        passThrough.end();
        const report = await parsePromise;
        expect(report).to.be.an.instanceOf(TreeReport);
        validateDetailReport(report);
        expect(parserCreateBuilderStub.callCount).to.equal(1);
        expect(parserCreateBuilderStub).calledWith(undefined, ReportMode.Tree);
        expect(builderParseSpy.callCount).to.equal(25);
        assert.isTrue(builderBuildSpy.calledOnce);
      });
    });

    describe('when streaming fails', () => {
      let builderParseStub: sinon.SinonStub;
      let builderBuildStub: sinon.SinonStub;

      beforeEach(() => {
        parserCreateBuilderStub.callsFake((rootDirectory, mode) => {
          const builder = originalCreateBuilder(
            rootDirectory as string,
            mode as ReportMode,
          );
          builderParseStub = sandbox.stub(builder, 'parse');
          builderBuildStub = sandbox.stub(builder, 'build');
          return builder;
        });
      });

      it('should reject when parsing fails', async () => {
        parserCreateBuilderStub.callsFake((rootDirectory, mode) => {
          const builder = originalCreateBuilder(
            rootDirectory as string,
            mode as ReportMode,
          );
          builderParseStub = sandbox
            .stub(builder, 'parse')
            .throws(new Error('parse error'));
          return builder;
        });
        const parsePromise = parser.parse(passThrough);
        passThrough.write(parserTesting.parserContents);
        passThrough.end();
        await expect(parsePromise).eventually.to.be.rejectedWith('parse error');
        assert.isTrue(builderParseStub.called);
      });

      it('should reject when building fails', async () => {
        parserCreateBuilderStub.callsFake((rootDirectory, mode) => {
          const builder = originalCreateBuilder(
            rootDirectory as string,
            mode as ReportMode,
          );
          builderBuildStub = sandbox
            .stub(builder, 'build')
            .throws(new Error('build error'));
          return builder;
        });
        const parsePromise = parser.parse(passThrough);
        passThrough.write(parserTesting.parserContents);
        passThrough.end();
        await expect(parsePromise).eventually.to.be.rejectedWith('build error');
        assert.isTrue(builderBuildStub.called);
      });

      it('should reject when stream errors out', async () => {
        const lineTransformerStub = sandbox
          .stub(LineTransformer.prototype, 'push')
          .throws(new Error('transform error'));
        const parsePromise = parser.parse(passThrough);
        passThrough.write(parserTesting.parserContents);
        passThrough.end();
        await expect(parsePromise).eventually.to.be.rejectedWith(
          'transform error',
        );
        assert.isTrue(lineTransformerStub.called);
      });
    });
  });
});
