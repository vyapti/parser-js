# parser-js

Parse LCOV formatted coverage data from a variety of inputs: Strings, Files,
Node Streams and Browser Streams through one consistent API.

## Usage
For Node Environments, the package can be `require`d and used:
```js
const fs = require('fs');
const { StreamParser, ReportMode } = require('@vyapti/parser');

const stream = fs.createReadStream('/path/to/lcov/file');
const streamParser = new StreamParser();
streamParser.parse(, {
  rootDirectory: '/base/path/to/project',
  encoding: 'ascii',
  mode: ReportMode.Detail,
}).then(report => {
  // Use the parsed report...
});
```

For Browser Environments, the package is exposed as `VyaptiParser` on the
`window` object.
```js
const { StreamParser, ReportMode } = window.VyaptiParser;

const streamParser = new StreamParser();
fetch(urlToLcovFile)
  .then(res => res.body)
  .then(stream => streamParser.parse(stream, {
      rootDirectory: 'vyapti/parser',
      encoding: 'utf-8',
      mode: ReportMode.Detail,
    }))
  .then(report => {
    // Use the parsed report...
  });
```

### API

The following parsers are exposed for use:
- `ContentParser` - parses lcov content from a string (new lines are still
  required)
- `FileParser` (Node only) - parses lcov content from a file
- `StreamParser` - parses lcov content from a stream
  - In Browsers, this is a `ReadableStream` from  the `Streams API`
  - In Node, this is a `Readable` stream from the `streams` module

Additionally, the `ReportMode` enum is exposed to determine the correct
`Report` to create (See `Reports` section).

Each parser can be constructed directly and provides two methods to handle
parsing:
- `parse(input, options)` - Parses `input` and returns a `Promise` of a
  `Report` (See `Reports` section).
  - `input` - the input source to parse. This determined by the type of parser:
    - `ContentParser` - a `string` containing the lcov formatted data
    - `FileParser` - a `string` containing the path to a file with lcov
      formatted data
    - `StreamParser` - a `stream` (depending on the environment) that contains
      the lcov formatted data
  - `options` - an object that provides several configuration options:
    - `encoding` - The encoding format used by the input. Defaults to `utf-8`
    - `mode` - a `ReportMode` that specifies the type of `Report` that should
      be generated. Defaults to `ReportMode.Simple`
    - `rootDirectory` a string containing the "starting" point of files tracked
      in the lcov data. File paths are relativized based on this string. Ex:
      passing `/root/projectA/src` as the root directory means that a file with
      path: `/root/projectA/src/moduleB/sourceC` becomes `moduleB/sourceC`.
      Defaults to `''`.

- `parseSync(input, options)` - Parses `input` and returns a `Report` (See
  `Reports` section).
  - The same function as `parse`, but runs in synchronously. See `parse` for
    details on the parameters.
> NOTE: `parseSync` is not available for `StreamParser`s.

### Reports
> Full documentation will be added soon, docs can be built locally using the
  `docs` package script.

`Report`s contain parsed data in a structure that allows easy access. There are
several types of reports that can be generated based on the `ReportMode` passed
to the `parse` methods:
- `Report` - A basic report that contains a total coverage summary, a list of
  files tracked in the coverage data, and a map of coverage summaries keyed by
  filename. Use `ReportMode.Simple` to generate this report.
- `FlatReport` - A detailed report that contains a total coverage summary, a
  list of files tracked in the coverage data, and a map of detailed coverage
  summaries keyed by filename. Use `ReportMode.Detail` to generate this report.
- `TreeReport` - A detailed report that contains a total coverage summary, a
  list of files tracked in the coverage data, and a tree structure (matching
  the file structure heirarchy of tracked files). Nodes in the tree structure
  (which represent directories) contain a coverage summary, a list of files
  that are descendants, and a map of nodes or leaves keyed by file name (or
  directory name). Leaves in the tree structure (which represent single files)
  are a detailed coverage summary. Use `ReportMore.Tree` to generate this
  report.

Each report contains the following properties:
- `total` - the total coverage `Summary` (docs TBD) that includes
  hits/totals/misses for lines/functions/branches in all tracked files
- `paths` - a list of files that are tracked within the report
- `details` - a map of `Summary`s (or `Summary` subclasses) that is keyed by
  the filename associated with the `Summary`
  - `FlatReport`s contain a map of `DetailedSummary`s (docs TBD) instead of
    `Summary`s
  - `TreeReport`s contain a map of `DetailedSummary`s or `TreeReportNode`s
    keyed by the relative filename or relative directory, respectively
    (docs TBD)
