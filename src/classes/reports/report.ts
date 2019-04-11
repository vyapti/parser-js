import Summary from '../summaries/summary';

class Report {
  protected _total: Summary;
  protected _paths: string[];
  protected _details: { [index: string]: Summary };

  constructor(
    total: Summary,
    paths: string[],
    details: { [index: string]: Summary },
  ) {
    this._total = total.clone();
    this._paths = paths.slice(0);
    this._details = {};
    Object.keys(details).forEach(key => {
      this._details[key] = details[key].clone();
    });
  }

  public get total(): Summary {
    return this._total;
  }

  public get paths(): string[] {
    return this._paths;
  }

  public get details(): { [index: string]: Summary } {
    return this._details;
  }
}

export default Report;
