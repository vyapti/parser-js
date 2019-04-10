/**
 * # Description of .info file
 * Originally from http://ltp.sourceforge.net/coverage/lcov/geninfo.1.php
 *
 * Following is a quick description of the tracefile  format  as  used  by
 * genhtml, geninfo and lcov.
 *
 * A tracefile is made up of several human-readable lines of text, divided
 * into sections. If available, a tracefile begins with the testname which
 * is stored in the following format:
 *
 *   TN:<test name>
 *
 * For  each  source  file  referenced in the .da file, there is a section
 * containing filename and coverage data:
 *
 *   SF:<absolute path to the source file>
 *
 * Following is a list of line numbers for each function name found in the
 * source file:
 *
 *   FN:<line number of function start>,<function name>
 *
 * Next,  there  is a list of execution counts for each instrumented function:
 *
 *   FNDA:<execution count>,<function name>
 *
 * This list is followed by two lines containing the number  of  functions
 * found and hit:
 *
 *   FNF:<number of functions found>
 *   FNH:<number of function hit>
 *
 * Branch coverage information is stored which one line per branch:
 *
 *   BRDA:<line number>,<block number>,<branch number>,<taken>
 *
 * Block  number  and  branch  number are gcc internal IDs for the branch.
 * Taken is either '-' if the basic block containing the branch was  never
 * executed or a number indicating how often that branch was taken.
 *
 * Branch coverage summaries are stored in two lines:
 *
 *   BRF:<number of branches found>
 *   BRH:<number of branches hit>
 *
 * Then  there  is  a  list of execution counts for each instrumented line
 * (i.e. a line which resulted in executable code):
 *
 *   DA:<line number>,<execution count>[,<checksum>]
 *
 * Note that there may be an optional checksum present  for  each  instru‐
 * mented  line.  The  current  geninfo implementation uses an MD5 hash as
 * checksumming algorithm.
 *
 * At the end of a section, there is a summary about how many  lines  were
 * found and how many were actually instrumented:
 *
 *    LH:<number of lines with a non-zero execution count>
 *    LF:<number of instrumented lines>
 *
 * Each sections ends with:
 *
 *    end_of_record
 */

export default {
  BranchCovered: 'BRDA',
  BranchFoundCount: 'BRF',
  BranchHitCount: 'BRH',
  CoveredLine: 'DA',
  EndSection: 'end_of_record',
  FunctionFoundCount: 'FNF',
  FunctionHitCount: 'FNH',
  FunctionName: 'FN',
  FunctionNameCovered: 'FNDA',
  LineFoundCount: 'LF',
  LineHitCount: 'LH',
  SourceFile: 'SF',
  TestName: 'TN',
};
