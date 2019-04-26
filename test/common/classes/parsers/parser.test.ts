import { assert, expect } from 'chai';
import * as sinon from 'sinon';

import FlatReportBuilder from '../../../../src/classes/builders/flatReportBuilder';
import ReportBuilder from '../../../../src/classes/builders/reportBuilder';
import TreeReportBuilder from '../../../../src/classes/builders/treeReportBuilder';
import Parser from '../../../../src/classes/parsers/parser';
import Record from '../../../../src/classes/records/record';
import Report from '../../../../src/classes/reports/report';
import Summary from '../../../../src/classes/summaries/summary';
import { ReportMode } from '../../../../src/utils';

class ParserTest extends Parser {
  public createBuilderRootDirectory: any;
  public createBuilderMode: any;

  public parseContentsContents: any;
  public parseContentsRootDirectory: any;
  public parseContentsMode: any;

  public mockBuilder: any;

  public parse(
    _: string,
    __: {
      encoding?: string;
      rootDirectory?: string;
      mode?: ReportMode;
    } = {},
  ): Promise<Report> {
    return Promise.resolve(
      new Report(
        new Summary(
          'test',
          'test',
          new Record(10, 4),
          new Record(10, 4),
          new Record(10, 4),
        ),
        [],
        {},
      ),
    );
  }

  public parseSync(
    _: string,
    __: {
      encoding?: string;
      rootDirectory?: string;
      mode?: ReportMode;
    } = {},
  ): Report {
    return new Report(
      new Summary(
        'test',
        'test',
        new Record(10, 4),
        new Record(10, 4),
        new Record(10, 4),
      ),
      [],
      {},
    );
  }

  public testCreateBuilder(
    rootDirectory?: string,
    mode?: ReportMode,
  ): ReportBuilder {
    this.createBuilderRootDirectory = rootDirectory;
    this.createBuilderMode = mode;
    return this.createBuilder(rootDirectory, mode);
  }

  public testParseContents(
    contents: string,
    rootDirectory?: string,
    mode?: ReportMode,
  ): Report {
    this.parseContentsContents = contents;
    this.parseContentsRootDirectory = rootDirectory;
    this.parseContentsMode = mode;
    return this.parseContents(contents, rootDirectory, mode);
  }

  protected createBuilder(
    rootDirectory?: string,
    mode?: ReportMode,
  ): ReportBuilder {
    if (this.mockBuilder) {
      return this.mockBuilder;
    }
    return super.createBuilder(rootDirectory, mode);
  }
}

describe('Parser (Abstract)', () => {
  describe('createBuilder (helper)', () => {
    let parser: ParserTest;

    beforeEach(() => {
      parser = new ParserTest();
    });

    describe('when not passing root directory', () => {
      it('creates a ReportBuilder when passing undefined', () => {
        const builder = parser.testCreateBuilder();
        expect(builder).to.be.an.instanceOf(ReportBuilder);
        assert.isUndefined(parser.createBuilderRootDirectory);
        assert.isUndefined(parser.createBuilderMode);
      });

      it('creates a ReportBuilder when passing ReportMode.Simple', () => {
        const builder = parser.testCreateBuilder(undefined, ReportMode.Simple);
        expect(builder).to.be.an.instanceOf(ReportBuilder);
        assert.isUndefined(parser.createBuilderRootDirectory);
        expect(parser.createBuilderMode).to.equal(ReportMode.Simple);
      });

      it('creates a FlatReportBuilder when passing ReportMode.Detail', () => {
        const builder = parser.testCreateBuilder(undefined, ReportMode.Detail);
        expect(builder).to.be.an.instanceOf(FlatReportBuilder);
        assert.isUndefined(parser.createBuilderRootDirectory);
        expect(parser.createBuilderMode).to.equal(ReportMode.Detail);
      });

      it('creates a TreeReportBuilder when passing ReportMode.Tree', () => {
        const builder = parser.testCreateBuilder(undefined, ReportMode.Tree);
        expect(builder).to.be.an.instanceOf(TreeReportBuilder);
        assert.isUndefined(parser.createBuilderRootDirectory);
        expect(parser.createBuilderMode).to.equal(ReportMode.Tree);
      });
    });

    describe('when passing root directory', () => {
      it('creates a ReportBuilder when passing undefined', () => {
        const builder = parser.testCreateBuilder('/root/directory');
        expect(builder).to.be.an.instanceOf(ReportBuilder);
        expect(parser.createBuilderRootDirectory).to.equal('/root/directory');
        assert.isUndefined(parser.createBuilderMode);
      });

      it('creates a ReportBuilder when passing ReportMode.Simple', () => {
        const builder = parser.testCreateBuilder(
          '/root/directory',
          ReportMode.Simple,
        );
        expect(builder).to.be.an.instanceOf(ReportBuilder);
        expect(parser.createBuilderRootDirectory).to.equal('/root/directory');
        expect(parser.createBuilderMode).to.equal(ReportMode.Simple);
      });

      it('creates a FlatReportBuilder when passing ReportMode.Detail', () => {
        const builder = parser.testCreateBuilder(
          '/root/directory',
          ReportMode.Detail,
        );
        expect(builder).to.be.an.instanceOf(FlatReportBuilder);
        expect(parser.createBuilderRootDirectory).to.equal('/root/directory');
        expect(parser.createBuilderMode).to.equal(ReportMode.Detail);
      });

      it('creates a TreeReportBuilder when passing ReportMode.Tree', () => {
        const builder = parser.testCreateBuilder(
          '/root/directory',
          ReportMode.Tree,
        );
        expect(builder).to.be.an.instanceOf(TreeReportBuilder);
        expect(parser.createBuilderRootDirectory).to.equal('/root/directory');
        expect(parser.createBuilderMode).to.equal(ReportMode.Tree);
      });
    });
  });

  describe('parseContents (helper)', () => {
    let parser: ParserTest;

    beforeEach(() => {
      parser = new ParserTest();
    });

    describe('should perform parsing for each line of content', () => {
      let reportBuilder: ReportBuilder;
      let mockBuilder: any;

      beforeEach(() => {
        reportBuilder = new ReportBuilder();
        mockBuilder = sinon.mock(reportBuilder);
        mockBuilder.expects('parse').atLeast(3);
        mockBuilder.expects('build').once();
        parser.mockBuilder = reportBuilder;
      });

      it('when no root directory or mode are specified', () => {
        parser.testParseContents('test\ntest\ntest\n');
        mockBuilder.verify();

        expect(parser.parseContentsContents).to.equal('test\ntest\ntest\n');
        assert.isUndefined(parser.parseContentsRootDirectory);
        assert.isUndefined(parser.parseContentsMode);
      });

      it('when root directory is specified but mode is not', () => {
        parser.testParseContents('test\ntest\ntest\n', '/root/directory');
        mockBuilder.verify();

        expect(parser.parseContentsContents).to.equal('test\ntest\ntest\n');
        expect(parser.parseContentsRootDirectory).to.equal('/root/directory');
        assert.isUndefined(parser.parseContentsMode);
      });

      it('when mode is specified but root directory is not', () => {
        parser.testParseContents(
          'test\ntest\ntest\n',
          undefined,
          ReportMode.Tree,
        );
        mockBuilder.verify();

        expect(parser.parseContentsContents).to.equal('test\ntest\ntest\n');
        assert.isUndefined(parser.parseContentsRootDirectory);
        expect(parser.parseContentsMode).to.equal(ReportMode.Tree);
      });

      it('when mode and root directory are specified', () => {
        parser.testParseContents(
          'test\ntest\ntest\n',
          '/root/directory',
          ReportMode.Tree,
        );
        mockBuilder.verify();

        expect(parser.parseContentsContents).to.equal('test\ntest\ntest\n');
        expect(parser.parseContentsRootDirectory).to.equal('/root/directory');
        expect(parser.parseContentsMode).to.equal(ReportMode.Tree);
      });
    });
  });
});
