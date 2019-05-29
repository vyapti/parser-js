# parser-js

Parse LCOV formatted coverage data from a variety of inputs: Strings, Files,
Node Streams and Browser Streams through one consistent API.

## Install
Parser-js is available either as a package or directly in browser
(using https://unpkg.com/):

Installing as a package
```bash
# Using yarn:
yarn add @vyapti/parser
# Using npm:
npm install @vyapti/parser
```

Adding in browser:
```html
<!-->Add this in your head section<-->
<script src="https://unpkg.com/@vyapti/parser@latest/dist/web/index.min.js"></script>
<!-->You can also use the unminified version for debugging<-->
<script src="https://unpkg.com/@vyapti/parser@latest/dist/web/index.js"></script>
```

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

## Examples
Examples of the parser-js usage are available in the `example/` directory for
both node and browser environments. All examples are runnable, so feel free to
clone the project and playaround!

To use the `node` examples, navigate to `example/node` and run a `yarn install`
or `npm install`. You can then run the available examples using `node`.

To use the `browser` examples, simply load the included `html` files in
`example/web`.

### API

The following parsers are exposed for use:
- [`ContentParser`][contentparserdoc] - parses lcov content from a string (new
  lines are still required)
- [`FileParser`][fileparserdoc] (Node only) - parses lcov content from a file
- [`StreamParser`][streamparserdoc] - parses lcov content from a stream
  - In Browsers, this is a `ReadableStream` from  the `Streams API`
  - In Node, this is a `Readable` stream from the `streams` module

Additionally, the [`ReportMode`][reportmodedoc] enum is exposed to determine the correct
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
> Full documentation is available [here](https://vyapti.github.io/parser-js/)

`Report`s contain parsed data in a structure that allows easy access. There are
several types of reports that can be generated based on the `ReportMode` passed
to the `parse` methods:
- [`Report`][reportdoc] - A basic report that contains a total coverage
  summary, a list of files tracked in the coverage data, and a map of coverage
  summaries keyed by filename. Use `ReportMode.Simple` to generate this report.
- [`FlatReport`][flatreportdoc] - A detailed report that contains a total
  coverage summary, a list of files tracked in the coverage data, and a map of
  detailed coverage summaries keyed by filename. Use `ReportMode.Detail` to
  generate this report.
- [`TreeReport`][treereportdoc] - A detailed report that contains a total
  coverage summary, a list of files tracked in the coverage data, and a tree
  structure (matching the file structure heirarchy of tracked files). Nodes in
  the tree structure (which represent directories) contain a coverage summary,
  a list of files that are descendants, and a map of nodes or leaves keyed by
  file name (or directory name). Leaves in the tree structure (which represent
  single files) are a detailed coverage summary. Use `ReportMode.Tree` to
  generate this report.

Each report contains the following properties:
- `total` - the total coverage [`Summary`][summarydoc] that includes
  hits/totals/misses for lines/functions/branches in all tracked files
- `paths` - a list of files that are tracked within the report
- `details` - a map of [`Summary`][summarydoc]s (or `Summary` subclasses) that
  is keyed by the filename associated with the `Summary`
  - `FlatReport`s contain a map of [`DetailedSummary`][detailedsummarydoc]s
    instead of `Summary`s
  - `TreeReport`s contain a map of [`DetailedSummary`][detailedsummarydoc]s or
    [`TreeReportNode`][treereportnodedoc]s keyed by the relative filename or
    relative directory, respectively

[contentparserdoc]: https://vyapti.github.io/parser-js/classes/contentparser.html
[fileparserdoc]: https://vyapti.github.io/parser-js/classes/fileparser.html
[streamparserdoc]: https://vyapti.github.io/parser-js/classes/streamparser.html
[reportmodedoc]: https://vyapti.github.io/parser-js/enums/reportmode.html
[reportdoc]: https://vyapti.github.io/parser-js/classes/report.html
[flatreportdoc]: https://vyapti.github.io/parser-js/classes/flatreport.html
[treereportdoc]: https://vyapti.github.io/parser-js/classes/treereport.html
[summarydoc]: https://vyapti.github.io/parser-js/classes/summary.html
[detailedsummarydoc]: https://vyapti.github.io/parser-js/classes/detailedsummary.html
[treereportnodedoc]: https://vyapti.github.io/parser-js/classes/treereportnode.html
