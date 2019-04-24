import { Transform } from 'stream';

class LineTransformer extends Transform {
  private _overflow: string = '';
  private _encoding: string;

  constructor(encoding: string = 'utf-8') {
    super();
    this._encoding = encoding;
  }

  public _transform(
    chunk: any,
    _: string,
    callback: (error?: Error | null, data?: any) => void,
  ): void {
    try {
      const chunkStr: string = chunk.toString(this._encoding);
      const total = this._overflow + chunkStr;
      const lines = total.split('\n');
      this._overflow = lines.pop() || '';
      lines.forEach(line => {
        this.push(Buffer.from(line));
      });
      callback(null, null);
    } catch (err) {
      callback(err, null);
    }
  }

  public _flush(callback: (error?: Error | null, data?: any) => void): void {
    this._overflow.split('\n').forEach(line => {
      this.push(Buffer.from(line));
    });
    callback(null, null);
  }
}

export default LineTransformer;
