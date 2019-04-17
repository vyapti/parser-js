import chai, { assert, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mocha';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';

import FileParser from '../../../src/classes/parsers/fileParser';
import FlatReport from '../../../src/classes/reports/flatReport';
import Report from '../../../src/classes/reports/report';
import TreeReport from '../../../src/classes/reports/treeReport';
import { ReportMode } from '../../../src/utils';
import fs from '../../../src/utils/fs';

import { parserTesting } from './contentParser.test';

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('FileParser', () => {
  let sandbox: sinon.SinonSandbox;
  let parser: FileParser;

  it('should construct properly when fs.readFile and fs.readFileSync are supported', () => {
    sandbox.stub(fs, 'readFile');
    sandbox.stub(fs, 'readFileSync');
    parser = new FileParser();
    expect(parser).to.be.an.instanceOf(FileParser);
    assert.isDefined(parser.parse);
    assert.isDefined(parser.parseSync);
  });

  it('should throw error if fs.readFile is not supported', () => {
    const readFileStub = sandbox.stub(fs, 'readFile');
    readFileStub.value(null);
    expect(() => {
      parser = new FileParser();
    }).to.throw('FileParser is not supported in this environment!');
  });

  it('should throw error if fs.readFileSync is not supported', () => {
    const readFileSyncStub = sandbox.stub(fs, 'readFileSync');
    readFileSyncStub.value(null);
    expect(() => {
      parser = new FileParser();
    }).to.throw('FileParser is not supported in this environment!');
  });

  it('should throw error if fs.readFile and fs.readFileSync are not supported', () => {
    const readFileStub = sandbox.stub(fs, 'readFile');
    const readFileSyncStub = sandbox.stub(fs, 'readFileSync');
    readFileStub.value(null);
    readFileSyncStub.value(null);
    expect(() => {
      parser = new FileParser();
    }).to.throw('FileParser is not supported in this environment!');
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('parse', () => {
    beforeEach(() => {
      parser = new FileParser();
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

      describe('when file reading succeeds', () => {
        let readFileStub: sinon.SinonStub;

        beforeEach(() => {
          readFileStub = sandbox.stub(fs, 'readFile');
          readFileStub.yields(null, parserTesting.parserContents);
        });

        it('should parse file into a Report by default', async () => {
          const report = await parser.parse('testpath', {
            rootDirectory: '/root',
          });
          expect(report).to.be.an.instanceOf(Report);
          validateBasicReport(report);
          expect(readFileStub).to.have.been.calledWith('testpath');
        });

        it('should parse file into a Report using Simple Report Mode', async () => {
          const report = await parser.parse('testpath', {
            rootDirectory: '/root',
            mode: ReportMode.Simple,
          });
          expect(report).to.be.an.instanceOf(Report);
          validateBasicReport(report);
          expect(readFileStub).to.have.been.calledWith('testpath');
        });

        it('should parse file into a FlatReport using Detail Report Mode', async () => {
          const report = await parser.parse('testpath', {
            rootDirectory: '/root',
            mode: ReportMode.Detail,
          });
          expect(report).to.be.an.instanceOf(FlatReport);
          validateDetailReport(report);
          expect(readFileStub).to.have.been.calledWith('testpath');
        });

        it('should parse file into a TreeReport using Tree Report Mode', async () => {
          const report = await parser.parse('testpath', {
            rootDirectory: '/root',
            mode: ReportMode.Tree,
          });
          expect(report).to.be.an.instanceOf(TreeReport);
          validateDetailReport(report);
          expect(readFileStub).to.have.been.calledWith('testpath');
        });
      });

      describe('when file reading fails', () => {
        let readFileStub: sinon.SinonStub;

        beforeEach(() => {
          readFileStub = sandbox.stub(fs, 'readFile');
          readFileStub.yields(
            new Error('stub error'),
            parserTesting.parserContents,
          );
        });

        it('should throw when no mode is passed', () => {
          assert.isRejected(
            parser.parse('testpath', {
              rootDirectory: '/root',
            }),
            'stub error',
          );
          expect(readFileStub).to.have.been.calledWith('testpath');
        });

        it('should throw when Simple Report Mode is passed', () => {
          assert.isRejected(
            parser.parse('testpath', {
              mode: ReportMode.Simple,
              rootDirectory: '/root',
            }),
            'stub error',
          );
          expect(readFileStub).to.have.been.calledWith('testpath');
        });

        it('should throw when Detail Report Mode is passed', () => {
          assert.isRejected(
            parser.parse('testpath', {
              mode: ReportMode.Detail,
              rootDirectory: '/root',
            }),
            'stub error',
          );
          expect(readFileStub).to.have.been.calledWith('testpath');
        });

        it('should throw when Tree Report Mode is passed', () => {
          assert.isRejected(
            parser.parse('testpath', {
              mode: ReportMode.Tree,
              rootDirectory: '/root',
            }),
            'stub error',
          );
          expect(readFileStub).to.have.been.calledWith('testpath');
        });
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

      describe('when file reading succeeds', () => {
        let readFileStub: sinon.SinonStub;

        beforeEach(() => {
          readFileStub = sandbox.stub(fs, 'readFile');
          readFileStub.yields(null, parserTesting.parserContents);
        });

        it('should parse file into a Report by default', async () => {
          const report = await parser.parse('testpath');
          expect(report).to.be.an.instanceOf(Report);
          validateBasicReport(report);
          expect(readFileStub).to.have.been.calledWith('testpath');
        });

        it('should parse file into a Report using Simple Report Mode', async () => {
          const report = await parser.parse('testpath', {
            mode: ReportMode.Simple,
          });
          expect(report).to.be.an.instanceOf(Report);
          validateBasicReport(report);
          expect(readFileStub).to.have.been.calledWith('testpath');
        });

        it('should parse file into a FlatReport using Detail Report Mode', async () => {
          const report = await parser.parse('testpath', {
            mode: ReportMode.Detail,
          });
          expect(report).to.be.an.instanceOf(FlatReport);
          validateDetailReport(report);
          expect(readFileStub).to.have.been.calledWith('testpath');
        });

        it('should parse file into a TreeReport using Tree Report Mode', async () => {
          const report = await parser.parse('testpath', {
            mode: ReportMode.Tree,
          });
          expect(report).to.be.an.instanceOf(TreeReport);
          validateDetailReport(report);
          expect(readFileStub).to.have.been.calledWith('testpath');
        });
      });

      describe('when file reading fails', () => {
        let readFileStub: sinon.SinonStub;

        beforeEach(() => {
          readFileStub = sandbox.stub(fs, 'readFile');
          readFileStub.yields(
            new Error('stub error'),
            parserTesting.parserContents,
          );
        });

        it('should throw when no mode is passed', () => {
          assert.isRejected(parser.parse('testpath'), 'stub error');
          expect(readFileStub).to.have.been.calledWith('testpath');
        });

        it('should throw when Simple Report Mode is passed', () => {
          assert.isRejected(
            parser.parse('testpath', {
              mode: ReportMode.Simple,
            }),
            'stub error',
          );
          expect(readFileStub).to.have.been.calledWith('testpath');
        });

        it('should throw when Detail Report Mode is passed', () => {
          assert.isRejected(
            parser.parse('testpath', {
              mode: ReportMode.Detail,
            }),
            'stub error',
          );
          expect(readFileStub).to.have.been.calledWith('testpath');
        });

        it('should throw when Tree Report Mode is passed', () => {
          assert.isRejected(
            parser.parse('testpath', {
              mode: ReportMode.Tree,
            }),
            'stub error',
          );
          expect(readFileStub).to.have.been.calledWith('testpath');
        });
      });
    });
  });

  describe('parseSync', () => {
    beforeEach(() => {
      parser = new FileParser();
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

      describe('when file reading succeeds', () => {
        let readFileSyncStub: sinon.SinonStub;

        beforeEach(() => {
          readFileSyncStub = sandbox.stub(fs, 'readFileSync');
          readFileSyncStub.returns(parserTesting.parserContents);
        });

        it('should parse file into a Report by default', () => {
          const report = parser.parseSync('testpath', {
            rootDirectory: '/root',
          });
          expect(report).to.be.an.instanceOf(Report);
          validateBasicReport(report);
          expect(readFileSyncStub).to.have.been.calledWith('testpath');
        });

        it('should parse file into a Report using Simple Report Mode', () => {
          const report = parser.parseSync('testpath', {
            rootDirectory: '/root',
            mode: ReportMode.Simple,
          });
          expect(report).to.be.an.instanceOf(Report);
          validateBasicReport(report);
          expect(readFileSyncStub).to.have.been.calledWith('testpath');
        });

        it('should parse file into a FlatReport using Detail Report Mode', () => {
          const report = parser.parseSync('testpath', {
            rootDirectory: '/root',
            mode: ReportMode.Detail,
          });
          expect(report).to.be.an.instanceOf(FlatReport);
          validateDetailReport(report);
          expect(readFileSyncStub).to.have.been.calledWith('testpath');
        });

        it('should parse file into a TreeReport using Tree Report Mode', () => {
          const report = parser.parseSync('testpath', {
            rootDirectory: '/root',
            mode: ReportMode.Tree,
          });
          expect(report).to.be.an.instanceOf(TreeReport);
          validateDetailReport(report);
          expect(readFileSyncStub).to.have.been.calledWith('testpath');
        });
      });

      describe('when file reading fails', () => {
        let readFileSyncStub: sinon.SinonStub;

        beforeEach(() => {
          readFileSyncStub = sandbox.stub(fs, 'readFileSync');
          readFileSyncStub.throws(new Error('stub error'));
        });

        it('should throw when no mode is passed', () => {
          expect(() => {
            parser.parseSync('testpath', {
              rootDirectory: '/root',
            });
          }).to.throw('stub error');
          expect(readFileSyncStub).to.have.been.calledWith('testpath');
        });

        it('should throw when Simple Report Mode is passed', () => {
          expect(() => {
            parser.parseSync('testpath', {
              mode: ReportMode.Simple,
              rootDirectory: '/root',
            });
          }).to.throw('stub error');
          expect(readFileSyncStub).to.have.been.calledWith('testpath');
        });

        it('should throw when Detail Report Mode is passed', () => {
          expect(() => {
            parser.parseSync('testpath', {
              mode: ReportMode.Detail,
              rootDirectory: '/root',
            });
          }).to.throw('stub error');
          expect(readFileSyncStub).to.have.been.calledWith('testpath');
        });

        it('should throw when Tree Report Mode is passed', () => {
          expect(() => {
            parser.parseSync('testpath', {
              mode: ReportMode.Tree,
              rootDirectory: '/root',
            });
          }).to.throw('stub error');
          expect(readFileSyncStub).to.have.been.calledWith('testpath');
        });
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

      describe('when file reading succeeds', () => {
        let readFileSyncStub: sinon.SinonStub;

        beforeEach(() => {
          readFileSyncStub = sandbox.stub(fs, 'readFileSync');
          readFileSyncStub.returns(parserTesting.parserContents);
        });

        it('should parse file into a Report by default', () => {
          const report = parser.parseSync('testpath');
          expect(report).to.be.an.instanceOf(Report);
          validateBasicReport(report);
          expect(readFileSyncStub).to.have.been.calledWith('testpath');
        });

        it('should parse file into a Report using Simple Report Mode', () => {
          const report = parser.parseSync('testpath', {
            mode: ReportMode.Simple,
          });
          expect(report).to.be.an.instanceOf(Report);
          validateBasicReport(report);
          expect(readFileSyncStub).to.have.been.calledWith('testpath');
        });

        it('should parse file into a FlatReport using Detail Report Mode', () => {
          const report = parser.parseSync('testpath', {
            mode: ReportMode.Detail,
          });
          expect(report).to.be.an.instanceOf(FlatReport);
          validateDetailReport(report);
          expect(readFileSyncStub).to.have.been.calledWith('testpath');
        });

        it('should parse file into a TreeReport using Tree Report Mode', () => {
          const report = parser.parseSync('testpath', {
            mode: ReportMode.Tree,
          });
          expect(report).to.be.an.instanceOf(TreeReport);
          validateDetailReport(report);
          expect(readFileSyncStub).to.have.been.calledWith('testpath');
        });
      });

      describe('when file reading fails', () => {
        let readFileSyncStub: sinon.SinonStub;

        beforeEach(() => {
          readFileSyncStub = sandbox.stub(fs, 'readFileSync');
          readFileSyncStub.throws(new Error('stub error'));
        });

        it('should throw when no mode is passed', () => {
          expect(() => {
            parser.parseSync('testpath');
          }).to.throw('stub error');
          expect(readFileSyncStub).to.have.been.calledWith('testpath');
        });

        it('should throw when Simple Report Mode is passed', () => {
          expect(() => {
            parser.parseSync('testpath', {
              mode: ReportMode.Simple,
            });
          }).to.throw('stub error');
          expect(readFileSyncStub).to.have.been.calledWith('testpath');
        });

        it('should throw when Detail Report Mode is passed', () => {
          expect(() => {
            parser.parseSync('testpath', {
              mode: ReportMode.Detail,
            });
          }).to.throw('stub error');
          expect(readFileSyncStub).to.have.been.calledWith('testpath');
        });

        it('should throw when Tree Report Mode is passed', () => {
          expect(() => {
            parser.parseSync('testpath', {
              mode: ReportMode.Tree,
            });
          }).to.throw('stub error');
          expect(readFileSyncStub).to.have.been.calledWith('testpath');
        });
      });
    });
  });
});
