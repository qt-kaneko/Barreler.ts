// Best worst code in the codebase
// If you'll use it in recursion, I wish you rest in peace
export class Mutex
{
  private _promise: Promise<unknown> = Promise.resolve();

  lock<T>(code: () => Promise<T>)
  {
    let promise = this._promise.then(code);

    // To free up resolved value and ignore errors
    this._promise = promise.then(() => {}, () => {});

    return promise;
  }
}