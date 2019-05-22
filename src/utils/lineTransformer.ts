import { Transform } from 'stream';

/**
 * Transform Stream that splits the stream by new lines
 *
 * An extension of a Node Transform Stream that decodes the incoming stream
 * using a given encoding and emits the contents line by line.
 */
class LineTransformer extends Transform {
  /**
   * The remaining part of the incoming stream that doesn't have a new line
   * assoaciated with it yet.
   */
  private _overflow: string = '';

  /**
   * The encoding of the contents of the stream.
   */
  private _encoding: string;

  /**
   * Construct a LineTransformer
   *
   * @param encoding the encoding of the input stream (defaults to "utf-8").
   */
  constructor(encoding: string = 'utf-8') {
    super();
    this._encoding = encoding;
  }

  /**
   * Transform
   *
   * The main logic associated with transforming the input stream. The input
   * chunk is decoded, split up by new lines, then each line is pushed out
   * using the default Buffer encoding.
   *
   * @param chunk    data chunk from the input stream
   * @param encoding the encoding of the data chunk (unused since encoding is
   *                 provided on construction)
   * @param callback The callback from transforming the stream to notify the
   *                 caller when transforming the chunk is done
   */
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

  /**
   * Flush
   *
   * When the incoming stream is done, this method is called to perform any
   * final logic before the stream is closed. The remaining overflow of the
   * stream is pushed
   */
  public _flush(callback: (error?: Error | null, data?: any) => void): void {
    this._overflow.split('\n').forEach(line => {
      this.push(Buffer.from(line));
    });
    callback(null, null);
  }
}

export default LineTransformer;
