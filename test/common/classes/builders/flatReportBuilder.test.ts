import FlatReportBuilder from '../../../../src/classes/builders/flatReportBuilder';
import FlatReport from '../../../../src/classes/reports/flatReport';
import DetailedSummary from '../../../../src/classes/summaries/detailedSummary';

import { reportBuilderTests } from './reportBuilder.test';

describe('FlatReportBuilder', () => {
  describe('in conformance to ReportBuilder', () => {
    reportBuilderTests(FlatReportBuilder, FlatReport, DetailedSummary);
  });
});
