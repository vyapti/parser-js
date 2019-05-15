// Merge Coverage Maps Consistently
//
// For some reason, files get instrumented differently
// when using karma and nyc. The inner data of the
// FileCoverage object appears to be missing data for
// some files, leading to errors that get thrown when
// attempting to report merged data
//
// To temporarily solve this, a more in-depth merging
// method is required that looks at both incoming CoverageMap
// and merges not only the hit counters, but also the underlying
// data maps.

const convertLocToString = (loc) => [loc.start.line, loc.start.column, loc.end.line, loc.end.column].join(':');

// both first and second are JSON versions of FileCoverage
const mergeFileCoverage = (first, second) => {
  const data = {
    path: '',
    statementMap: {},
    fnMap: {},
    branchMap: {},
    s: {},
    f: {},
    b: {},
  };
  const meta = {
    statementMap: {},
    branchMap: {},
    fnMap: {},
    sRemapFirst: {},
    sRemapSecond: {},
    bRemapFirst: {},
    bRemapSecond: {},
    fRemapFirst: {},
    fRemapSecond: {},
  };
  if (first.path !== second.path) {
    throw new Error('Cannot merge different files!');
  }
  data.path = first.path;

  // Merge Statement Maps
  let idx = 0;
  Object.entries(first.statementMap).forEach(([key, value]) => {
    const locString = convertLocToString(value)
    if (meta.statementMap[locString] === undefined) {
      meta.statementMap[locString] = idx;
      data.statementMap[idx] = value;
      idx += 1;
    }
    meta.sRemapFirst[key] = meta.statementMap[locString];
  });
  Object.entries(second.statementMap).forEach(([key, value]) => {
    const locString = convertLocToString(value)
    if (meta.statementMap[locString] === undefined) {
      meta.statementMap[locString] = idx;
      data.statementMap[idx] = value;
      idx += 1;
    }
    meta.sRemapSecond[key] = meta.statementMap[locString];
  });
  // Merge Statement Hits
  Object.entries(first.s).forEach(([key, value]) => {
    const remapped = meta.sRemapFirst[key];
    if (!data.s[remapped]) {
      data.s[remapped] = value;
    } else {
      data.s[remapped] += value;
    }
  });
  Object.entries(second.s).forEach(([key, value]) => {
    const remapped = meta.sRemapSecond[key];
    if (!data.s[remapped]) {
      data.s[remapped] = value;
    } else {
      data.s[remapped] += value;
    }
  });

  // Merge Function Maps
  idx = 0;
  Object.entries(first.fnMap).forEach(([key, value]) => {
    const locString = convertLocToString(value.loc)
    if (meta.fnMap[locString] === undefined) {
      meta.fnMap[locString] = idx;
      data.fnMap[idx] = value;
      idx += 1;
    }
    meta.fRemapFirst[key] = meta.fnMap[locString];
  });
  Object.entries(second.fnMap).forEach(([key, value]) => {
    const locString = convertLocToString(value.loc)
    if (meta.fnMap[locString] === undefined) {
      meta.fnMap[locString] = idx;
      data.fnMap[idx] = value;
      idx += 1;
    }
    meta.fRemapSecond[key] = meta.fnMap[locString];
  });
  // Merge Function Hits
  Object.entries(first.f).forEach(([key, value]) => {
    const remapped = meta.fRemapFirst[key];
    if (!data.f[remapped]) {
      data.f[remapped] = value;
    } else {
      data.f[remapped] += value;
    }
  });
  Object.entries(second.f).forEach(([key, value]) => {
    const remapped = meta.fRemapSecond[key];
    if (!data.f[remapped]) {
      data.f[remapped] = value;
    } else {
      data.f[remapped] += value;
    }
  });

  // Merge Branch Maps
  idx = 0;
  Object.entries(first.branchMap).forEach(([key, value]) => {
    const locString = convertLocToString(value.loc)
    if (meta.branchMap[locString] === undefined) {
      meta.branchMap[locString] = idx;
      data.branchMap[idx] = value;
      idx += 1;
    }
    meta.bRemapFirst[key] = meta.branchMap[locString];
  });
  Object.entries(second.branchMap).forEach(([key, value]) => {
    const locString = convertLocToString(value.loc)
    if (meta.branchMap[locString] === undefined) {
      meta.branchMap[locString] = idx;
      data.branchMap[idx] = value;
      idx += 1;
    }
    meta.bRemapSecond[key] = meta.branchMap[locString];
  });
  // Merge Branch Hits
  Object.entries(first.b).forEach(([key, value]) => {
    const remapped = meta.bRemapFirst[key];
    if (!data.b[remapped]) {
      data.b[remapped] = [...value];
    } else {
      const original = data.b[remapped];
      value.forEach((v, idx) => {
        if (idx >= original.length) {
          original.push(v);
        } else {
          original[idx] += v;
        }
      });
    }
  });
  Object.entries(second.b).forEach(([key, value]) => {
    const remapped = meta.bRemapSecond[key];
    if (!data.b[remapped]) {
      data.b[remapped] = [...value];
    } else {
      const original = data.b[remapped];
      value.forEach((v, idx) => {
        if (idx >= original.length) {
          original.push(v);
        } else {
          original[idx] += v;
        }
      });
    }
  });

  return data;
};

// both first and second are JSON versions of CoverageMap
const merge = (first, second) => {
  const data = Object.create(null);
  const mergeFC = (([key, value]) => {
    if (data[key]) {
      data[key] = mergeFileCoverage(data[key], value);
    } else {
      data[key] = value;
    }
  });
  Object.entries(first).forEach(mergeFC);
  Object.entries(second).forEach(mergeFC);

  return data;
};

module.exports = {
  mergeCoverage: merge,
}
