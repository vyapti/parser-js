import chai, { assert, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';

import BrowserStreamParser from '../../../../src/classes/parsers/browserStreamParser';
import FlatReport from '../../../../src/classes/reports/flatReport';
import Report from '../../../../src/classes/reports/report';
import TreeReport from '../../../../src/classes/reports/treeReport';
import { ReportMode } from '../../../../src/utils';

import { parserTesting } from '../../../common/classes/parsers/contentParser.test';

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('BrowserStreamParser', () => {
  let sandbox: sinon.SinonSandbox;
  let parser: BrowserStreamParser;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should construct properly', () => {
    parser = new BrowserStreamParser();
    expect(parser).to.be.an.instanceOf(BrowserStreamParser);
    assert.isDefined(parser.parse);
    assert.isDefined(parser.parseSync);
  });

  describe('parse', () => {
    let passThrough: sinon.SinonStubbedInstance<ReadableStream>;
    let readStub: sinon.SinonStub;
    let originalCreateBuilder: (...args: any[]) => any;
    let parserCreateBuilderStub: sinon.SinonStub;
    let builderParseSpy: sinon.SinonSpy;
    let builderBuildSpy: sinon.SinonSpy;

    beforeEach(() => {
      const textEncoder = new TextEncoder();
      const value = textEncoder.encode(parserTesting.parserContents);
      const mockReader = {
        cancel: sandbox.stub(),
        closed: Promise.resolve(),
        read: sandbox.stub(),
        releaseLock: sandbox.stub(),
      }
      readStub = mockReader.read;
      mockReader.read.onCall(0).resolves({ done: false, value })
      mockReader.read.onCall(1).resolves({ done: true, value: null });
      passThrough = sandbox.createStubInstance(ReadableStream);
      passThrough.getReader.returns(mockReader);
      parser = new BrowserStreamParser();
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
        const parsePromise = parser.parse(passThrough as ReadableStream, {
          rootDirectory: '/root',
        });
        const report = await parsePromise;
        expect(report).to.be.an.instanceOf(Report);
        validateBasicReport(report);
        expect(parserCreateBuilderStub.callCount).to.equal(1);
        expect(parserCreateBuilderStub).calledWith('/root', undefined);
        expect(builderParseSpy.callCount).to.equal(25);
        assert.isTrue(builderBuildSpy.calledOnce);
      });

      it('should parse stream into a Report when using Simple Report Mode', async () => {
        const parsePromise = parser.parse(passThrough as ReadableStream, {
          mode: ReportMode.Simple,
          rootDirectory: '/root',
        });
        const report = await parsePromise;
        expect(report).to.be.an.instanceOf(Report);
        validateBasicReport(report);
        expect(parserCreateBuilderStub.callCount).to.equal(1);
        expect(parserCreateBuilderStub).calledWith('/root', ReportMode.Simple);
        expect(builderParseSpy.callCount).to.equal(25);
        assert.isTrue(builderBuildSpy.calledOnce);
      });

      it('should parse stream into a FlatReport when using Detail Report Mode', async () => {
        const parsePromise = parser.parse(passThrough as ReadableStream, {
          mode: ReportMode.Detail,
          rootDirectory: '/root',
        });
        const report = await parsePromise;
        expect(report).to.be.an.instanceOf(FlatReport);
        validateDetailReport(report);
        expect(parserCreateBuilderStub.callCount).to.equal(1);
        expect(parserCreateBuilderStub).calledWith('/root', ReportMode.Detail);
        expect(builderParseSpy.callCount).to.equal(25);
        assert.isTrue(builderBuildSpy.calledOnce);
      });

      it('should parse stream into a TreeReport when using Tree Report Mode', async () => {
        const parsePromise = parser.parse(passThrough as ReadableStream, {
          mode: ReportMode.Tree,
          rootDirectory: '/root',
        });
        const report = await parsePromise;
        expect(report).to.be.an.instanceOf(TreeReport);
        validateDetailReport(report);
        expect(parserCreateBuilderStub.callCount).to.equal(1);
        expect(parserCreateBuilderStub).calledWith('/root', ReportMode.Tree);
        expect(builderParseSpy.callCount).to.equal(25);
        assert.isTrue(builderBuildSpy.calledOnce);
      });
    });

    describe('when no passing root directory', () => {
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
        const parsePromise = parser.parse(passThrough as ReadableStream);
        const report = await parsePromise;
        expect(report).to.be.an.instanceOf(Report);
        validateBasicReport(report);
        expect(parserCreateBuilderStub.callCount).to.equal(1);
        expect(parserCreateBuilderStub).calledWith(undefined, undefined);
        expect(builderParseSpy.callCount).to.equal(25);
        assert.isTrue(builderBuildSpy.calledOnce);
      });

      it('should parse stream into a Report when using Simple Report Mode', async () => {
        const parsePromise = parser.parse(passThrough as ReadableStream, {
          mode: ReportMode.Simple,
        });
        const report = await parsePromise;
        expect(report).to.be.an.instanceOf(Report);
        validateBasicReport(report);
        expect(parserCreateBuilderStub.callCount).to.equal(1);
        expect(parserCreateBuilderStub).calledWith(undefined, ReportMode.Simple);
        expect(builderParseSpy.callCount).to.equal(25);
        assert.isTrue(builderBuildSpy.calledOnce);
      });

      it('should parse stream into a FlatReport when using Detail Report Mode', async () => {
        const parsePromise = parser.parse(passThrough as ReadableStream, {
          mode: ReportMode.Detail,
        });
        const report = await parsePromise;
        expect(report).to.be.an.instanceOf(FlatReport);
        validateDetailReport(report);
        expect(parserCreateBuilderStub.callCount).to.equal(1);
        expect(parserCreateBuilderStub).calledWith(undefined, ReportMode.Detail);
        expect(builderParseSpy.callCount).to.equal(25);
        assert.isTrue(builderBuildSpy.calledOnce);
      });

      it('should parse stream into a TreeReport when using Tree Report Mode', async () => {
        const parsePromise = parser.parse(passThrough as ReadableStream, {
          mode: ReportMode.Tree,
        });
        const report = await parsePromise;
        expect(report).to.be.an.instanceOf(TreeReport);
        validateDetailReport(report);
        expect(parserCreateBuilderStub.callCount).to.equal(1);
        expect(parserCreateBuilderStub).calledWith(undefined, ReportMode.Tree);
        expect(builderParseSpy.callCount).to.equal(25);
        assert.isTrue(builderBuildSpy.calledOnce);
      });
    });

    it('should handle other encoding types', async () => {
      const buff = Buffer.from(parserTesting.parserContents, 'ascii');
      readStub.onCall(0).resolves({ done: false, value: buff });
      readStub.onCall(1).resolves({ done: true, value: null });
      const parsePromise = parser.parse(passThrough as ReadableStream, {
        encoding: 'ascii',
      });
      const report = await parsePromise;
      expect(report).to.be.an.instanceOf(Report);
      parserTesting.validateTotalSummary(report);
      parserTesting.validatePath(report, '/root/test');
      parserTesting.validateBasicSummary(report, '/root/test');
      expect(parserCreateBuilderStub.callCount).to.equal(1);
      expect(parserCreateBuilderStub).calledWith(undefined, undefined);
      expect(builderParseSpy.callCount).to.equal(25);
      assert.isTrue(builderBuildSpy.calledOnce);
    });
  });
});
