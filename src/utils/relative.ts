const pathSeparator: RegExp = /[\/\\]+/;
const driveRoot: RegExp = /[a-zA-Z]\:/;

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

export function normalizeRoot(str: string) {
  const result = ['', ''];
  if (!isRoot(str)) {
    return result;
  }

  const rootCapture = new RegExp(`^(?:${pathSeparator.source})?(?:(${driveRoot.source})(?:${pathSeparator.source})?)?`);
  const matches: RegExpExecArray = (rootCapture.exec(str) as RegExpExecArray);

  result[0] = matches[0];
  if (matches[1]) {
    result[1] = `/${matches[1]}/`;
  } else {
    result[1] = '/';
  }

  return result;
}

export function compareRoots(str1: string, str2: string): boolean {
  const [matchedRoot1] = normalizeRoot(str1);
  const [matchedRoot2] = normalizeRoot(str2);
  return matchedRoot1 === matchedRoot2;
}

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

  if(fromNormal === '') {
    // fromNormal is an empty string, so relative path can't be found
    // return the toNormal
    return toNormal;
  }

  if (rootCheck === 2 && !compareRoots(fromNormal, toNormal)) {
    // Both are roots, but they are not the same root, so relative path can't be found
    // Return the toNormal
    return toNormal;
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

  const fromUpDirs = fromSegments.map(() => '..');
  const related = `${fromUpDirs.join('/')}${fromUpDirs.length > 0 ? '/' : ''}${toSegments.join('/')}`;

  const relatedNormal = normalize(related);

  return relatedNormal;
}
