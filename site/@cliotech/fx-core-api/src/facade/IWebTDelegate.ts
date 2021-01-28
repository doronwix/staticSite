export interface IWebTDelegate<T> {
  Add: (cb: (...args: OptionalSpreadParams<T>) => void) => void;

  Remove: (cb: (...args: OptionalSpreadParams<T>) => void) => void;
}
