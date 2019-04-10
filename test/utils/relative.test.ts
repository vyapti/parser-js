import { assert, expect } from 'chai';
import 'mocha';

import relative, {
  compareRoots,
  isRoot,
  normalize,
  normalizeRoot,
} from '../../src/utils/relative';

describe('relative (utility)', () => {
  describe('posix format', () => {
    describe('should return normalized "to" path', () => {
      it('when "from" is a root and "to" is not', () => {
        expect(relative('/test/test', 'test/test')).to.equal('test/test');
        expect(relative('/test/test', 'test/./test')).to.equal('test/test');
        expect(relative('/test/test', 'test/../test')).to.equal('test');
        expect(relative('/test/test', './test/test')).to.equal('test/test');
        expect(relative('/test/test', '../test/test')).to.equal('../test/test');
        expect(relative('/test/test', 'test/test/./')).to.equal('test/test');
        expect(relative('/test/test', 'test/test/../')).to.equal('test');
      });

      it('when "to" is a root and "from" is not', () => {
        expect(relative('test/test', '/test/test')).to.equal('/test/test');
        expect(relative('test/test', '/test/./test')).to.equal('/test/test');
        expect(relative('test/test', '/test/../test')).to.equal('/test');
        expect(relative('test/test', '/test/test/./')).to.equal('/test/test');
        expect(relative('test/test', '/test/test/..')).to.equal('/test');
        expect(relative('test/test', '/./test/test')).to.equal('/test/test');
        expect(relative('test/test', '/../test/test')).to.equal('/test/test');
      });

      it('when "from" path resolves to empty string', () => {
        expect(relative('.', 'test/test')).to.equal('test/test');
        expect(relative('test/..', 'test/./test')).to.equal('test/test');
        expect(relative('tes/test/../../', 'test/../test')).to.equal('test');
        expect(relative('./test/..', './test/test')).to.equal('test/test');
        expect(relative('./test/../test/../', '../test/test')).to.equal(
          '../test/test',
        );
        expect(relative('././././', 'test/test/./')).to.equal('test/test');
        expect(relative('./test/../././test/..', 'test/test/../')).to.equal(
          'test',
        );
      });
    });

    describe('when relative path', () => {
      it('should return empty string when paths are equal', () => {
        expect(relative('test/test', 'test/test')).to.equal('');
        expect(relative('./test/test', './test/test')).to.equal('');
        expect(relative('../test/test', '../test/test')).to.equal('');
        expect(relative('test/./test', 'test/./test')).to.equal('');
        expect(relative('test/../test', 'test/../test')).to.equal('');
        expect(relative('test/test./', 'test/test./')).to.equal('');
        expect(relative('test/test../', 'test/test../')).to.equal('');
      });

      it('should resolve when "to" is a downstream descendant of "from"', () => {
        expect(relative('test', 'test/then')).to.equal('then');
        expect(relative('test', 'test/./then')).to.equal('then');
        expect(relative('test', 'test/then/./')).to.equal('then');
        expect(relative('test', 'test/then/..')).to.equal('');
        expect(relative('test', 'test/then/next')).to.equal('then/next');
        expect(relative('test', 'test/then/./next')).to.equal('then/next');
        expect(relative('test', 'test/then/../next')).to.equal('next');
        expect(relative('test', 'test/then/next/./')).to.equal('then/next');
        expect(relative('test', 'test/then/next/../')).to.equal('then');
      });

      it('should resolve when "from" is a downstream descendant of "to"', () => {
        expect(relative('test/then', 'test')).to.equal('..');
        expect(relative('test/./then', 'test')).to.equal('..');
        expect(relative('test/then/./', 'test')).to.equal('..');
        expect(relative('test/then/..', 'test')).to.equal('');
        expect(relative('test/then/next', 'test')).to.equal('../..');
        expect(relative('test/then/./next', 'test')).to.equal('../..');
        expect(relative('test/then/../next', 'test')).to.equal('..');
        expect(relative('test/then/next/./', 'test')).to.equal('../..');
        expect(relative('test/then/next/../', 'test')).to.equal('..');
      });

      it('should resolve when "to" and "from" path do not share common ancestor', () => {
        expect(relative('test/test', 'new/new')).to.equal('../../new/new');
        expect(relative('test/./test', 'new/new')).to.equal('../../new/new');
        expect(relative('test/../test', 'new/new')).to.equal('../new/new');
        expect(relative('test/test', 'new/./new')).to.equal('../../new/new');
        expect(relative('test/test', 'new/../new')).to.equal('../../new');
      });
    });

    describe('when absolute path', () => {
      it('should return empty string when paths are equal', () => {
        expect(relative('/test/test', '/test/test')).to.equal('');
        expect(relative('/test/./test', '/test/./test')).to.equal('');
        expect(relative('/test/../test', '/test/../test')).to.equal('');
        expect(relative('/test/test/.', '/test/test/.')).to.equal('');
        expect(relative('/test/test/..', '/test/test/..')).to.equal('');
        expect(relative('/./test/test', '/./test/test')).to.equal('');
        expect(relative('/../test/test', '/../test/test')).to.equal('');
      });

      it('should resolve when "to" is a downstream descendant of "from"', () => {
        expect(relative('/test/./', '/test/then')).to.equal('then');
        expect(relative('/test/../test', '/test/./then')).to.equal('then');
        expect(relative('/test/./', '/test/then/./')).to.equal('then');
        expect(relative('/test/../test/./', '/test/then/..')).to.equal('');
        expect(relative('/test/././', '/test/then/next')).to.equal('then/next');
        expect(relative('/test', '/test/then/./next')).to.equal('then/next');
        expect(relative('/test', '/test/then/../next')).to.equal('next');
        expect(relative('/test', '/test/then/next/./')).to.equal('then/next');
        expect(relative('/test', '/test/then/next/../')).to.equal('then');
      });

      it('should resolve when "from" is a downstream descendant of "to"', () => {
        expect(relative('/test/then', '/test')).to.equal('..');
        expect(relative('/test/./then', '/test')).to.equal('..');
        expect(relative('/test/then/./', '/test')).to.equal('..');
        expect(relative('/test/then/..', '/test')).to.equal('');
        expect(relative('/test/then/next', '/test')).to.equal('../..');
        expect(relative('/test/then/./next', '/test')).to.equal('../..');
        expect(relative('/test/then/../next', '/test')).to.equal('..');
        expect(relative('/test/then/next/./', '/test')).to.equal('../..');
        expect(relative('/test/then/next/../', '/test')).to.equal('..');
      });

      it('should resolve when "to" and "from" path do not share common ancestor', () => {
        expect(relative('/test/test', '/new/new')).to.equal('../../new/new');
        expect(relative('/test/./test', '/new/new')).to.equal('../../new/new');
        expect(relative('/test/../test', '/new/new')).to.equal('../new/new');
        expect(relative('/test/test', '/new/./new')).to.equal('../../new/new');
        expect(relative('/test/test', '/new/../new')).to.equal('../../new');
      });
    });
  });

  describe('dos format', () => {
    describe('should return normalized "to" path', () => {
      it('when "from" is a root and "to" is not', () => {
        expect(relative('C:\\test\\test', 'test\\test')).to.equal('test/test');
        expect(relative('C:\\test\\test', 'test\\.\\test')).to.equal(
          'test/test',
        );
        expect(relative('C:\\test\\test', 'test\\..\\test')).to.equal('test');
        expect(relative('C:\\test\\test', '.\\test\\test')).to.equal(
          'test/test',
        );
        expect(relative('C:\\test\\test', '..\\test\\test')).to.equal(
          '../test/test',
        );
        expect(relative('C:\\test\\test', 'test\\test\\.\\')).to.equal(
          'test/test',
        );
        expect(relative('C:\\test\\test', 'test\\test\\..\\')).to.equal('test');
      });

      it('when "to" is a root and "from" is not', () => {
        expect(relative('test\\test', 'D:\\test\\test')).to.equal(
          '/D:/test/test',
        );
        expect(relative('test\\test', 'D:\\test\\.\\test')).to.equal(
          '/D:/test/test',
        );
        expect(relative('test\\test', 'D:\\test\\..\\test')).to.equal(
          '/D:/test',
        );
        expect(relative('test\\test', 'D:\\test\\test\\.\\')).to.equal(
          '/D:/test/test',
        );
        expect(relative('test\\test', 'D:\\test\\test\\..')).to.equal(
          '/D:/test',
        );
        expect(relative('test\\test', 'D:\\.\\test\\test')).to.equal(
          '/D:/test/test',
        );
        expect(relative('test\\test', 'D:\\..\\test\\test')).to.equal(
          '/D:/test/test',
        );
      });

      it('when "from" path resolves to empty string', () => {
        expect(relative('.', 'test\\test')).to.equal('test/test');
        expect(relative('test\\..', 'test\\.\\test')).to.equal('test/test');
        expect(relative('tes\\test\\..\\..\\', 'test\\..\\test')).to.equal(
          'test',
        );
        expect(relative('.\\test\\..', '.\\test\\test')).to.equal('test/test');
        expect(relative('.\\test\\..\\test\\..\\', '..\\test\\test')).to.equal(
          '../test/test',
        );
        expect(relative('.\\.\\.\\.\\', 'test\\test\\.\\')).to.equal(
          'test/test',
        );
        expect(
          relative('.\\test\\..\\.\\.\\test\\..', 'test\\test\\..\\'),
        ).to.equal('test');
      });

      it('when input paths do not share the same root', () => {
        expect(relative('C:\\test\\test', 'D:\\test\\test')).to.equal(
          '/D:/test/test',
        );
        expect(relative('C:\\test\\.\\test', 'D:\\test\\.\\test')).to.equal(
          '/D:/test/test',
        );
        expect(relative('C:\\test\\..\test', 'D:\\test\\..\\test')).to.equal(
          '/D:/test',
        );
        expect(relative('C:\\test\\test\\.\\', 'D:\\test\\test\\.\\')).to.equal(
          '/D:/test/test',
        );
        expect(relative('C:\\test\\test\\..', 'D:\\test\\test\\..')).to.equal(
          '/D:/test',
        );
        expect(relative('C:\\.\\test\\test', 'D:\\.\\test\\test')).to.equal(
          '/D:/test/test',
        );
        expect(relative('C:\\..\\test\\test', 'D:\\..\\test\\test')).to.equal(
          '/D:/test/test',
        );
      });
    });

    describe('when relative path', () => {
      it('should return empty string when paths are equal', () => {
        expect(relative('test\\test', 'test\\test')).to.equal('');
        expect(relative('.\\test\\test', '.\\test\\test')).to.equal('');
        expect(relative('..\\test\\test', '..\\test\\test')).to.equal('');
        expect(relative('test\\.\\test', 'test\\.\\test')).to.equal('');
        expect(relative('test\\..\\test', 'test\\..\\test')).to.equal('');
        expect(relative('test\\test\\.', 'test\\test\\.')).to.equal('');
        expect(relative('test\\test\\..', 'test\\test\\..')).to.equal('');
      });

      it('should resolve when "to" is a downstream descendant of "from"', () => {
        expect(relative('test', 'test\\then')).to.equal('then');
        expect(relative('test', 'test\\.\\then')).to.equal('then');
        expect(relative('test', 'test\\then\\.\\')).to.equal('then');
        expect(relative('test', 'test\\then\\..')).to.equal('');
        expect(relative('test', 'test\\then\\next')).to.equal('then/next');
        expect(relative('test', 'test\\then\\.\\next')).to.equal('then/next');
        expect(relative('test', 'test\\then\\..\\next')).to.equal('next');
        expect(relative('test', 'test\\then\\next\\.\\')).to.equal('then/next');
        expect(relative('test', 'test\\then\\next\\..\\')).to.equal('then');
      });

      it('should resolve when "from" is a downstream descendant of "to"', () => {
        expect(relative('test\\then', 'test')).to.equal('..');
        expect(relative('test\\.\\then', 'test')).to.equal('..');
        expect(relative('test\\then\\.\\', 'test')).to.equal('..');
        expect(relative('test\\then\\..', 'test')).to.equal('');
        expect(relative('test\\then\\next', 'test')).to.equal('../..');
        expect(relative('test\\then\\.\\next', 'test')).to.equal('../..');
        expect(relative('test\\then\\..\\next', 'test')).to.equal('..');
        expect(relative('test\\then\\next\\.\\', 'test')).to.equal('../..');
        expect(relative('test\\then\\next\\..\\', 'test')).to.equal('..');
      });

      it('should resolve when "to" and "from" path do not share common ancestor', () => {
        expect(relative('test\\test', 'new\\new')).to.equal('../../new/new');
        expect(relative('test\\.\\test', 'new\\new')).to.equal('../../new/new');
        expect(relative('test\\..\\test', 'new\\new')).to.equal('../new/new');
        expect(relative('test\\test', 'new\\.\\new')).to.equal('../../new/new');
        expect(relative('test\\test', 'new\\..\\new')).to.equal('../../new');
      });
    });

    describe('when absolute path', () => {
      it('should return empty string when paths are equal', () => {
        expect(relative('C:\\test\\test', 'C:\\test\\test')).to.equal('');
        expect(relative('C:\\test\\.\\test', 'C:\\test\\.\\test')).to.equal('');
        expect(relative('C:\\test\\..\\test', 'C:\\test\\..\\test')).to.equal(
          '',
        );
        expect(relative('C:\\test\\test\\.', 'C:\\test\\test\\.')).to.equal('');
        expect(relative('C:\\test\\test\\..', 'C:\\test\\test\\..')).to.equal(
          '',
        );
        expect(relative('C:\\.\\test\\test', 'C:\\.\\test\\test')).to.equal('');
        expect(relative('C:\\..\\test\\test', 'C:\\..\\test\\test')).to.equal(
          '',
        );
      });

      it('should resolve when "to" is a downstream descendant of "from"', () => {
        expect(relative('C:\\test\\.\\', 'C:\\test\\then')).to.equal('then');
        expect(relative('C:\\test\\..\\test', 'C:\\test\\.\\then')).to.equal(
          'then',
        );
        expect(relative('C:\\test\\.\\', 'C:\\test\\then\\.\\')).to.equal(
          'then',
        );
        expect(
          relative('C:\\test\\..\\test\\.\\', 'C:\\test\\then\\..'),
        ).to.equal('');
        expect(relative('C:\\test\\.\\.\\', 'C:\\test\\then\\next')).to.equal(
          'then/next',
        );
        expect(relative('C:\\test', 'C:\\test\\then\\.\\next')).to.equal(
          'then/next',
        );
        expect(relative('C:\\test', 'C:\\test\\then\\..\\next')).to.equal(
          'next',
        );
        expect(relative('C:\\test', 'C:\\test\\then\\next\\.\\')).to.equal(
          'then/next',
        );
        expect(relative('C:\\test', 'C:\\test\\then\\next\\..\\')).to.equal(
          'then',
        );
      });

      it('should resolve when "from" is a downstream descendant of "to"', () => {
        expect(relative('C:\\test\\then', 'C:\\test')).to.equal('..');
        expect(relative('C:\\test\\.\\then', 'C:\\test')).to.equal('..');
        expect(relative('C:\\test\\then\\.\\', 'C:\\test')).to.equal('..');
        expect(relative('C:\\test\\then\\..', 'C:\\test')).to.equal('');
        expect(relative('C:\\test\\then\\next', 'C:\\test')).to.equal('../..');
        expect(relative('C:\\test\\then\\.\\next', 'C:\\test')).to.equal(
          '../..',
        );
        expect(relative('C:\\test\\then\\..\\next', 'C:\\test')).to.equal('..');
        expect(relative('C:\\test\\then\\next\\.\\', 'C:\\test')).to.equal(
          '../..',
        );
        expect(relative('C:\\test\\then\\next\\..\\', 'C:\\test')).to.equal(
          '..',
        );
      });

      it('should resolve when "to" and "from" path do not share common ancestor', () => {
        expect(relative('D:\\test\\test', 'D:\\new\\new')).to.equal(
          '../../new/new',
        );
        expect(relative('D:\\test\\.\\test', 'D:\\new\\new')).to.equal(
          '../../new/new',
        );
        expect(relative('D:\\test\\..\\test', 'D:\\new\\new')).to.equal(
          '../new/new',
        );
        expect(relative('D:\\test\\test', 'D:\\new\\.\\new')).to.equal(
          '../../new/new',
        );
        expect(relative('D:\\test\\test', 'D:\\new\\..\\new')).to.equal(
          '../../new',
        );
      });
    });
  });

  describe('web dos format', () => {
    describe('should return normalized "to" path', () => {
      it('when "from" is a root and "to" is not', () => {
        expect(relative('/d:/test/test', 'test/test')).to.equal('test/test');
        expect(relative('/d:/test/test', 'test/./test')).to.equal('test/test');
        expect(relative('/d:/test/test', 'test/../test')).to.equal('test');
        expect(relative('/d:/test/test', './test/test')).to.equal('test/test');
        expect(relative('/d:/test/test', '../test/test')).to.equal(
          '../test/test',
        );
        expect(relative('/d:/test/test', 'test/test/./')).to.equal('test/test');
        expect(relative('/d:/test/test', 'test/test/../')).to.equal('test');
      });

      it('when "to" is a root and "from" is not', () => {
        expect(relative('test/test', '/c:/test/test')).to.equal(
          '/c:/test/test',
        );
        expect(relative('test/test', '/c:/test/./test')).to.equal(
          '/c:/test/test',
        );
        expect(relative('test/test', '/c:/test/../test')).to.equal('/c:/test');
        expect(relative('test/test', '/c:/test/test/./')).to.equal(
          '/c:/test/test',
        );
        expect(relative('test/test', '/c:/test/test/..')).to.equal('/c:/test');
        expect(relative('test/test', '/c:/./test/test')).to.equal(
          '/c:/test/test',
        );
        expect(relative('test/test', '/c:/../test/test')).to.equal(
          '/c:/test/test',
        );
      });

      it('when input paths do not share the same root', () => {
        expect(relative('/d:/test/test', '/c:/test/test')).to.equal(
          '/c:/test/test',
        );
        expect(relative('/d:/test/./test', '/c:/test/./test')).to.equal(
          '/c:/test/test',
        );
        expect(relative('/d:/test/../test', '/c:/test/../test')).to.equal(
          '/c:/test',
        );
        expect(relative('/d:/test/test/./', '/c:/test/test/./')).to.equal(
          '/c:/test/test',
        );
        expect(relative('/d:/test/test/..', '/c:/test/test/..')).to.equal(
          '/c:/test',
        );
        expect(relative('/d:/./test/test', '/c:/./test/test')).to.equal(
          '/c:/test/test',
        );
        expect(relative('/d:/../test/test', '/c:/../test/test')).to.equal(
          '/c:/test/test',
        );
      });
    });

    describe('when absolute path', () => {
      it('should return empty string when paths are equal', () => {
        expect(relative('/d:/test/test', '/d:/test/test')).to.equal('');
        expect(relative('/d:/test/./test', '/d:/test/./test')).to.equal('');
        expect(relative('/d:/test/../test', '/d:/test/../test')).to.equal('');
        expect(relative('/d:/test/test./', '/d:/test/test./')).to.equal('');
        expect(relative('/d:/test/test..', '/d:/test/test..')).to.equal('');
        expect(relative('/d:/./test/test', '/d:/./test/test')).to.equal('');
        expect(relative('/d:/../test/test', '/d:/../test/test')).to.equal('');
      });

      it('should resolve when "to" is a downstream descendant of "from"', () => {
        expect(relative('/d:/test/./', '/d:/test/then')).to.equal('then');
        expect(relative('/d:/test/../test', '/d:/test/./then')).to.equal(
          'then',
        );
        expect(relative('/d:/test/./', '/d:/test/then/./')).to.equal('then');
        expect(relative('/d:/test/../test/./', '/d:/test/then/..')).to.equal(
          '',
        );
        expect(relative('/d:/test/././', '/d:/test/then/next')).to.equal(
          'then/next',
        );
        expect(relative('/d:/test', '/d:/test/then/./next')).to.equal(
          'then/next',
        );
        expect(relative('/d:/test', '/d:/test/then/../next')).to.equal('next');
        expect(relative('/d:/test', '/d:/test/then/next/./')).to.equal(
          'then/next',
        );
        expect(relative('/d:/test', '/d:/test/then/next/../')).to.equal('then');
      });

      it('should resolve when "from" is a downstream descendant of "to"', () => {
        expect(relative('/d:/test/then', '/d:/test')).to.equal('..');
        expect(relative('/d:/test/./then', '/d:/test')).to.equal('..');
        expect(relative('/d:/test/then/./', '/d:/test')).to.equal('..');
        expect(relative('/d:/test/then/..', '/d:/test')).to.equal('');
        expect(relative('/d:/test/then/next', '/d:/test')).to.equal('../..');
        expect(relative('/d:/test/then/./next', '/d:/test')).to.equal('../..');
        expect(relative('/d:/test/then/../next', '/d:/test')).to.equal('..');
        expect(relative('/d:/test/then/next/./', '/d:/test')).to.equal('../..');
        expect(relative('/d:/test/then/next/../', '/d:/test')).to.equal('..');
      });

      it('should resolve when "to" and "from" path do not share common ancestor', () => {
        expect(relative('/d:/test/test', '/d:/new/new')).to.equal(
          '../../new/new',
        );
        expect(relative('/d:/test/./test', '/d:/new/new')).to.equal(
          '../../new/new',
        );
        expect(relative('/d:/test/../test', '/d:/new/new')).to.equal(
          '../new/new',
        );
        expect(relative('/d:/test/test', '/d:/new/./new')).to.equal(
          '../../new/new',
        );
        expect(relative('/d:/test/test', '/d:/new/../new')).to.equal(
          '../../new',
        );
      });
    });
  });

  describe('isRoot (private)', () => {
    describe('posix format', () => {
      it('should detect root for absolute path', () => {
        assert.isOk(isRoot('/root/path'), 'absolute posix path is a root');
        assert.isOk(
          isRoot('/root/./path'),
          'absolute posix path containing "." is a root',
        );
        assert.isOk(
          isRoot('/root/../path'),
          'absolute posix path containing ".." is a root',
        );
      });

      it('should not detect root for relative path', () => {
        assert.isNotOk(
          isRoot('./relative/path'),
          'relative posix path starting with "." is not a root',
        );
        assert.isNotOk(
          isRoot('../relative/path'),
          'relative posix path starting with ".." is not a root',
        );
        assert.isNotOk(
          isRoot('relative/path'),
          'relative posix path starting implicitly from cwd is not a root',
        );
      });
    });

    describe('dos format', () => {
      it('should detect root for absolute path', () => {
        assert.isOk(
          isRoot('D:\\dos\\absolute\\path'),
          'absolute dos path is a root',
        );
        assert.isOk(
          isRoot('D:\\dos\\.\\absolute\\path'),
          'absolute dos path containing "." is a root',
        );
        assert.isOk(
          isRoot('D:\\dos\\..\\absolute\\path'),
          'absolute dos path containing ".." is a root',
        );
      });

      it('should not detect root for relative path', () => {
        assert.isNotOk(
          isRoot('.\\relative\\path'),
          'relative posix path starting with "." is not a root',
        );
        assert.isNotOk(
          isRoot('..\\relative\\path'),
          'relative posix path starting with ".." is not a root',
        );
        assert.isNotOk(
          isRoot('relative\\path'),
          'relative posix path starting implicitly from cwd is not a root',
        );
      });
    });

    describe('web dos format', () => {
      it('should detect root for absolute path', () => {
        assert.isOk(
          isRoot('/D:/dos/absolute/path'),
          'absolute dos web path is a root',
        );
        assert.isOk(
          isRoot('/D:/dos/./absolute/path'),
          'absolute dos web path containing "." is a root',
        );
        assert.isOk(
          isRoot('/D:/dos/../absolute/path'),
          'absolute dos web path containing ".." is a root',
        );
      });
    });
  });

  describe('normalizeRoot (private)', () => {
    describe('posix format', () => {
      it('should return empty results when input is not a root', () => {
        expect(normalizeRoot('')).to.deep.equal(['', '']);
        expect(normalizeRoot('relative/path')).to.deep.equal(['', '']);
        expect(normalizeRoot('./relative/path')).to.deep.equal(['', '']);
        expect(normalizeRoot('../relative/path')).to.deep.equal(['', '']);
      });

      it('should return root when input is an empty root', () => {
        expect(normalizeRoot('/')).to.deep.equal(['/', '/']);
      });

      it('should return root when input is full path', () => {
        expect(normalizeRoot('/root/path')).to.deep.equal(['/', '/']);
        expect(normalizeRoot('/root/./path')).to.deep.equal(['/', '/']);
        expect(normalizeRoot('/root/../path')).to.deep.equal(['/', '/']);
      });
    });

    describe('dos format', () => {
      it('should return empty results when input is not a root', () => {
        expect(normalizeRoot('')).to.deep.equal(['', '']);
        expect(normalizeRoot('relative\\path')).to.deep.equal(['', '']);
        expect(normalizeRoot('.\\relative\\path')).to.deep.equal(['', '']);
        expect(normalizeRoot('..\\relative\\path')).to.deep.equal(['', '']);
      });

      it('should return root when input is an empty root', () => {
        expect(normalizeRoot('D:')).to.deep.equal(['D:', '/D:/']);
        expect(normalizeRoot('D:\\')).to.deep.equal(['D:\\', '/D:/']);
      });

      it('should return root when input is full path', () => {
        expect(normalizeRoot('D:\\root\\path')).to.deep.equal(['D:\\', '/D:/']);
        expect(normalizeRoot('D:\\root\\.\\path')).to.deep.equal([
          'D:\\',
          '/D:/',
        ]);
        expect(normalizeRoot('D:\\root\\..\\path')).to.deep.equal([
          'D:\\',
          '/D:/',
        ]);
      });
    });

    describe('web dos format', () => {
      it('should return root when input is an empty root', () => {
        expect(normalizeRoot('/D:')).to.deep.equal(['/D:', '/D:/']);
        expect(normalizeRoot('/D:/')).to.deep.equal(['/D:/', '/D:/']);
      });

      it('should return root when input is full path', () => {
        expect(normalizeRoot('/d:/root/path')).to.deep.equal(['/d:/', '/d:/']);
        expect(normalizeRoot('/d:/root/./path')).to.deep.equal([
          '/d:/',
          '/d:/',
        ]);
        expect(normalizeRoot('/d:/root/../path')).to.deep.equal([
          '/d:/',
          '/d:/',
        ]);
      });
    });
  });

  describe('compareRoots (private)', () => {
    describe('posix format', () => {
      it('should return true when roots match', () => {
        assert.isTrue(
          compareRoots('relative/path', 'another/relative/path'),
          'relative posix paths share the same root',
        );
        assert.isTrue(
          compareRoots('/', '/'),
          'absolute posix paths share the same root',
        );
        assert.isTrue(
          compareRoots('/', '/test'),
          'absolute posix paths share the same root',
        );
        assert.isTrue(
          compareRoots('/test', '/'),
          'absolute posix paths share the same root',
        );
        assert.isTrue(
          compareRoots('/root/path', '/different/path'),
          'absolute posix paths share the same root',
        );
        assert.isTrue(
          compareRoots('/root/./path', '/different/../path'),
          'absolute posix paths share the same root',
        );
      });

      it("should return false when roots don't match", () => {
        assert.isFalse(compareRoots('/', 'relative'));
        assert.isFalse(compareRoots('/', './relative'));
        assert.isFalse(compareRoots('/', '../relative'));
        assert.isFalse(compareRoots('relative', '/'));
        assert.isFalse(compareRoots('./relative', '/'));
        assert.isFalse(compareRoots('../relative', '/'));
        assert.isFalse(compareRoots('/relative', 'relative'));
        assert.isFalse(compareRoots('/relative', './relative'));
        assert.isFalse(compareRoots('/relative', '../relative'));
        assert.isFalse(compareRoots('relative', '/relative'));
        assert.isFalse(compareRoots('./relative', '/relative'));
        assert.isFalse(compareRoots('../relative', '/relative'));
      });
    });

    describe('dos format', () => {
      it('should return true when roots match', () => {
        assert.isTrue(
          compareRoots('relative\\path', 'another\\relative\\path'),
          'relative posix paths share the same root',
        );
        assert.isTrue(
          compareRoots('C:\\', 'C:\\'),
          'absolute dos paths with the same drive share the same root',
        );
        assert.isTrue(
          compareRoots('C:\\', 'C:\\test'),
          'absolute dos paths with the same drive share the same root',
        );
        assert.isTrue(
          compareRoots('C:\\test', 'C:\\'),
          'absolute dos paths with the same drive share the same root',
        );
        assert.isTrue(
          compareRoots('C:\\path', 'C:\\different'),
          'absolute dos paths with the same drive share the same root',
        );
        assert.isTrue(
          compareRoots('C:\\root\\.\\path', 'C:\\different\\..\\path'),
          'absolute dos paths with the same drive share the same root',
        );
      });

      it("should return false when roots don't match", () => {
        assert.isFalse(compareRoots('c:\\', 'relative'));
        assert.isFalse(compareRoots('c:\\', '.\\relative'));
        assert.isFalse(compareRoots('c:\\', '..\\relative'));
        assert.isFalse(compareRoots('relative', 'c:\\'));
        assert.isFalse(compareRoots('.\\relative', 'c:\\'));
        assert.isFalse(compareRoots('..\\relative', 'c:\\'));
        assert.isFalse(compareRoots('c:\\relative', 'relative'));
        assert.isFalse(compareRoots('c:\\relative', '.\\relative'));
        assert.isFalse(compareRoots('c:\\relative', '..\\relative'));
        assert.isFalse(compareRoots('relative', 'c:\\relative'));
        assert.isFalse(compareRoots('.\\relative', 'c:\\relative'));
        assert.isFalse(compareRoots('..\\relative', 'c:\\relative'));
      });
    });

    describe('web dos format', () => {
      it('should return true when roots match', () => {
        assert.isTrue(
          compareRoots('/C:/', '/C:/'),
          'absolute web dos paths with the same drive share the same root',
        );
        assert.isTrue(
          compareRoots('/C:/', '/C:/test'),
          'absolute web dos paths with the same drive share the same root',
        );
        assert.isTrue(
          compareRoots('/C:/test', '/C:/'),
          'absolute web dos paths with the same drive share the same root',
        );
        assert.isTrue(
          compareRoots('/C:/path', '/C:/different'),
          'absolute web dos paths with the same drive share the same root',
        );
        assert.isTrue(
          compareRoots('/C:/root/./path', '/C:/different/../path'),
          'absolute web dos paths with the same drive share the same root',
        );
      });

      it("should return false when roots don't match", () => {
        assert.isFalse(compareRoots('/D:/', 'relative'));
        assert.isFalse(compareRoots('/D:/', './relative'));
        assert.isFalse(compareRoots('/D:/', '../relative'));
        assert.isFalse(compareRoots('relative', '/D:'));
        assert.isFalse(compareRoots('./relative', '/D:'));
        assert.isFalse(compareRoots('../relative', '/D:'));
        assert.isFalse(compareRoots('/D:/relative', 'relative'));
        assert.isFalse(compareRoots('/D:/relative', './relative'));
        assert.isFalse(compareRoots('/D:/relative', '../relative'));
        assert.isFalse(compareRoots('relative', '/D:/relative'));
        assert.isFalse(compareRoots('./relative', '/D:/relative'));
        assert.isFalse(compareRoots('../relative', '/D:/relative'));
      });
    });
  });

  describe('normalize (private)', () => {
    describe('posix format', () => {
      it('should resolve "." and empty segments', () => {
        expect(normalize('test')).to.equal('test');
        expect(normalize('test/')).to.equal('test');
        expect(normalize('./test')).to.equal('test');
        expect(normalize('././test')).to.equal('test');
        expect(normalize('test/.')).to.equal('test');
        expect(normalize('test/./test1')).to.equal('test/test1');
        expect(normalize('/test')).to.equal('/test');
        expect(normalize('/test/')).to.equal('/test');
        expect(normalize('/./test/')).to.equal('/test');
        expect(normalize('/test/./')).to.equal('/test');
        expect(normalize('/test/./test')).to.equal('/test/test');
      });

      it('should resolve ".." segments', () => {
        expect(normalize('test/../test1')).to.equal('test1');
        expect(normalize('test/.././test1')).to.equal('test1');
        expect(normalize('test/test1/../')).to.equal('test');
        expect(normalize('test/test1/../../')).to.equal('');
        expect(normalize('test/test1/.././../')).to.equal('');
        expect(normalize('../test')).to.equal('../test');
        expect(normalize('../test/../test1')).to.equal('../test1');
        expect(normalize('.././test/')).to.equal('../test');
        expect(normalize('../../../test/.././../test1')).to.equal(
          '../../../../test1',
        );

        expect(normalize('/test/../test1')).to.equal('/test1');
        expect(normalize('/test/.././test1')).to.equal('/test1');
        expect(normalize('/test/test1/..')).to.equal('/test');
        expect(normalize('/test/test1/../..')).to.equal('/');
        expect(normalize('/test/test1/.././..')).to.equal('/');
        expect(normalize('/../test')).to.equal('/test');
        expect(normalize('/../test/../test1')).to.equal('/test1');
        expect(normalize('/.././test')).to.equal('/test');
        expect(normalize('/../../../test/.././../test1')).to.equal('/test1');
      });
    });

    describe('dos format', () => {
      it('should resolve "." and empty segments', () => {
        expect(normalize('test')).to.equal('test');
        expect(normalize('test\\')).to.equal('test');
        expect(normalize('.\\test')).to.equal('test');
        expect(normalize('.\\.\\test')).to.equal('test');
        expect(normalize('test\\.')).to.equal('test');
        expect(normalize('test\\.\\test1')).to.equal('test/test1');
        expect(normalize('C:\\test')).to.equal('/C:/test');
        expect(normalize('C:\\test\\')).to.equal('/C:/test');
        expect(normalize('C:\\.\\test\\')).to.equal('/C:/test');
        expect(normalize('C:\\test\\.\\')).to.equal('/C:/test');
        expect(normalize('C:\\test\\.\\test')).to.equal('/C:/test/test');
      });

      it('should resolve ".." segments', () => {
        expect(normalize('test\\..\\test1')).to.equal('test1');
        expect(normalize('test\\..\\.\\test1')).to.equal('test1');
        expect(normalize('test\\test1\\..\\')).to.equal('test');
        expect(normalize('test\\test1\\..\\..\\')).to.equal('');
        expect(normalize('test\\test1\\..\\.\\..\\')).to.equal('');
        expect(normalize('..\\test')).to.equal('../test');
        expect(normalize('..\\test\\..\\test1')).to.equal('../test1');
        expect(normalize('..\\.\\test\\')).to.equal('../test');
        expect(normalize('..\\..\\..\\test\\..\\.\\..\\test1')).to.equal(
          '../../../../test1',
        );

        expect(normalize('D:\\test\\..\\test1')).to.equal('/D:/test1');
        expect(normalize('D:\\test\\..\\.\\test1')).to.equal('/D:/test1');
        expect(normalize('D:\\test\\test1\\..')).to.equal('/D:/test');
        expect(normalize('D:\\test\\test1\\..\\..')).to.equal('/D:/');
        expect(normalize('D:\\test\\test1\\..\\.\\..')).to.equal('/D:/');
        expect(normalize('D:\\..\\test')).to.equal('/D:/test');
        expect(normalize('D:\\..\\test\\..\\test1')).to.equal('/D:/test1');
        expect(normalize('D:\\..\\.\\test')).to.equal('/D:/test');
        expect(normalize('D:\\..\\..\\..\\test\\..\\.\\..\\test1')).to.equal(
          '/D:/test1',
        );
      });
    });

    describe('web dos format', () => {
      it('should resolve "." and empty segments', () => {
        expect(normalize('test')).to.equal('test');
        expect(normalize('test/')).to.equal('test');
        expect(normalize('./test')).to.equal('test');
        expect(normalize('././test')).to.equal('test');
        expect(normalize('test/.')).to.equal('test');
        expect(normalize('test/./test1')).to.equal('test/test1');
        expect(normalize('/d:/test')).to.equal('/d:/test');
        expect(normalize('/d:/test/')).to.equal('/d:/test');
        expect(normalize('/d:/./test/')).to.equal('/d:/test');
        expect(normalize('/d:/test/./')).to.equal('/d:/test');
        expect(normalize('/d:/test/./test')).to.equal('/d:/test/test');
      });

      it('should resolve ".." segments', () => {
        expect(normalize('test/../test1')).to.equal('test1');
        expect(normalize('test/.././test1')).to.equal('test1');
        expect(normalize('test/test1/../')).to.equal('test');
        expect(normalize('test/test1/../../')).to.equal('');
        expect(normalize('test/test1/.././../')).to.equal('');
        expect(normalize('../test')).to.equal('../test');
        expect(normalize('../test/../test1')).to.equal('../test1');
        expect(normalize('.././test/')).to.equal('../test');
        expect(normalize('../../../test/.././../test1')).to.equal(
          '../../../../test1',
        );

        expect(normalize('/c:/test/../test1')).to.equal('/c:/test1');
        expect(normalize('/c:/test/.././test1')).to.equal('/c:/test1');
        expect(normalize('/c:/test/test1/..')).to.equal('/c:/test');
        expect(normalize('/c:/test/test1/../..')).to.equal('/c:/');
        expect(normalize('/c:/test/test1/.././..')).to.equal('/c:/');
        expect(normalize('/c:/../test')).to.equal('/c:/test');
        expect(normalize('/c:/../test/../test1')).to.equal('/c:/test1');
        expect(normalize('/c:/.././test')).to.equal('/c:/test');
        expect(normalize('/c:/../../../test/.././../test1')).to.equal(
          '/c:/test1',
        );
      });
    });
  });
});
