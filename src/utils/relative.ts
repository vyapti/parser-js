const pathSeparator: RegExp = /\/+|\\+/;
const driveRoot: RegExp = /[a-zA-Z]\:/;

function isRoot(str: string): boolean {
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

function normalizeRoot(str: string) {
  const result = ['', ''];
  if (!isRoot(str)) {
    return result
  }

  const rootCapture = new RegExp(`^(?:${pathSeparator.source})?(?:(${driveRoot.source})(?:${pathSeparator.source})?)?`);
  const matches = rootCapture.exec(str);

  if (!matches) {
    return result
  }

  result[0] = matches[0];
  if (matches[1]) {
    result[1] = `/${matches[1]}/`;
  } else {
    result[1] = '/';
  }

  return result;
}

function compareRoots(str1: string, str2: string): boolean {
  const [matchedRoot1] = normalizeRoot(str1);
  const [matchedRoot2] = normalizeRoot(str2);
  return matchedRoot1 === matchedRoot2;
}

function normalize(str: string): string {
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
      // If str is absolute path AND there is a segment to remove
      if (matchedRoot.length > 0) {
        const last = resolvedSegments.pop();
        if (last && last === '..') {
          resolvedSegments.push(last);
          resolvedSegments.push(segment);
        }
      } else {
        const last = resolvedSegments.pop();
        if (last && last === '..') {
          resolvedSegments.push(last);
        }
        if (!last || last === '..') {
          resolvedSegments.push(segment);
        }

      }
      return;
    }

    // // Check if up directory
    // if (segment === '..') {
    //   // Remove the last segment if it isn't a up directory itself,
    //   // Otherwise add the up directory to the resolved segments
    //   if (resolvedSegments.length > 0 && resolvedSegments[resolvedSegments.length - 1] !== '..') {
    //     resolvedSegments.pop();
    //   } else {
    //     resolvedSegments.push(segment);
    //   }
    //   return;
    // }
    // Push segment onto the resolved segments
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
