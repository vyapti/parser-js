const pathSeparator: RegExp = /[\/\\]+/;
const driveRoot: RegExp = /[a-zA-Z]\:/;

/**
 * Check if incoming string is a root path
 *
 * @remarks
 * This method supports unix, dos, and web dos paths such as:
 * ```
 * /unix/root/path
 * C:\dos\root\path
 * /c:/web/dos/root/path
 * ```
 *
 * @param str the path to test
 * @returns Whether or not the path contains a root
 */
export function isRoot(str: string): boolean {
  const startsWithSeparator = new RegExp(`^${pathSeparator.source}`);
  if (startsWithSeparator.test(str)) {
    return true;
  }

  const startsWithDriveRoot = new RegExp(`^${driveRoot.source}`);
  if (startsWithDriveRoot.test(str)) {
    return true;
  }

  return false;
}

/**
 * Normalize an incoming path's root and return both the normalized root as
 * well as the originally matched root.
 *
 * If the incoming path is not a root path, an empty string is returned for
 * both the normalized root and the original root
 *
 * @remarks
 * Roots are normalized to a unix-like format using '/' as the root. If a dos
 * or web dos path is incoming, the format is '/<driveLetter>:/'
 *
 * @param str the path whose root should be normalized
 * @returns an array of length 2 where the first entry is the original root and
 *          the second entry is the normalized root
 */
export function normalizeRoot(str: string) {
  const result = ['', ''];
  if (!isRoot(str)) {
    return result;
  }

  const rootCapture = new RegExp(
    `^(?:${pathSeparator.source})?(?:(${driveRoot.source})(?:${
      pathSeparator.source
    })?)?`,
  );
  const matches: RegExpExecArray = rootCapture.exec(str) as RegExpExecArray;

  result[0] = matches[0];
  if (matches[1]) {
    result[1] = `/${matches[1]}/`;
  } else {
    result[1] = '/';
  }

  return result;
}

/**
 * Compare two roots to determine if they are the same
 *
 * This method supports comparing different path formats for the same root path
 * ```ts
 * compareRoots('/c:/root', 'C:\\root'); // returns true!
 * ```
 */
export function compareRoots(str1: string, str2: string): boolean {
  const [matchedRoot1] = normalizeRoot(str1);
  const [matchedRoot2] = normalizeRoot(str2);
  return matchedRoot1 === matchedRoot2;
}

/**
 * Normalize a given path to a shared format
 *
 * Allows parsing paths to be easier since a single format is used. The format
 * includes normalizing the root (see {@link normalizeRoot | normalizeRoot} for
 * the normalized root format), and converting all path separators to '/'.
 */
export function normalize(str: string): string {
  const [matchedRoot, normalizedRoot] = normalizeRoot(str);
  const segmentStr = str.substring(matchedRoot.length);
  const segments = segmentStr.split(pathSeparator);
  const resolvedSegments: string[] = [];

  segments.forEach(segment => {
    // Skip if current directory or empty
    if (segment === '.' || segment === '') {
      return;
    }
    // Check if up directory
    if (segment === '..') {
      // Remove last segment to handle the up directory
      const last = resolvedSegments.pop();

      // Check if str is a relative path -- there are special
      // cases where the up directory effect cannot be resolved
      if (matchedRoot.length === 0) {
        if (last === '..') {
          // The last up directory couldn't be resolved, so push it
          // back onto the stack. this will happen if a relative path
          // starts with ".." such as "../../test"
          resolvedSegments.push(last);
        }
        if (!last || last === '..') {
          // we have to push the current segment (an up directory)
          // onto the stack since the last segment either not defined or an
          // up directory itself. In both cases the current segment cannot be
          // handled.
          resolvedSegments.push(segment);
        }
      }
      return;
    }

    resolvedSegments.push(segment);
  });

  return `${normalizedRoot}${resolvedSegments.join('/')}`;
}

/**
 * Determine the normalized relative path from one path to another
 *
 * @remarks
 * Incoming paths are normalized first and then compared against one another.
 * The inputs can be either both relative paths or both root paths that share
 * the same root.
 *
 * The following list of unsupported cases returns the normalized "to" path
 * - from is relative, to is a root
 * - from is a root, to is relative
 * - from and to are both roots, but do not share the same root
 *
 * @param from the source path to use as the base of the relative path
 * @param to the destination path that should be resolved
 * @returns the normalized relative path between the two input paths
 */
export default function relative(from: string, to: string): string {
  // shortcut check
  if (from === to) {
    return '';
  }

  // Determine roots for each path and use it to shortcut if needed
  const rootCheck = (isRoot(from) ? 1 : 0) + (isRoot(to) ? 1 : 0);
  if (rootCheck === 1) {
    // We don't have a common reference between each path, so use the normalized to path
    return normalize(to);
  }

  const [fromNormal, toNormal] = [from, to].map(normalize);

  if (fromNormal === '') {
    // fromNormal is an empty string, so relative path can't be found
    // return the toNormal
    return toNormal;
  }

  if (rootCheck === 2 && !compareRoots(fromNormal, toNormal)) {
    // Both are roots, but they are not the same root, so relative path can't be found
    // Return the toNormal
    return toNormal;
  }

  // direct descendent shortcut check
  if (toNormal.startsWith(fromNormal)) {
    const difference = toNormal.substring(fromNormal.length);
    // the next part of the difference is a '/' indicating toNormal
    // is a direct descendant of fromNormal. remove it and return so
    // the result is a relative path
    if (difference.startsWith('/')) {
      return difference.substring(1);
    }
  }

  // Attempt to find a common ancestor between the two paths, then
  // back track to that point and go to the to path

  const fromSegments = fromNormal.split('/');
  const toSegments = toNormal.split('/');

  const commonAncestorSegments = [];

  while (fromSegments.length > 0) {
    const segment = fromSegments[0];
    if (segment === toSegments[0]) {
      // Segments match move it to the common ancestor path
      commonAncestorSegments.push(toSegments.shift());
      fromSegments.shift();
    } else {
      break;
    }
  }

  const fromUpDirs = fromSegments.filter(s => s !== '').map(() => '..');
  const related = `${fromUpDirs.join('/')}${
    fromUpDirs.length > 0 ? '/' : ''
  }${toSegments.join('/')}`;

  const relatedNormal = normalize(related);

  return relatedNormal;
}
