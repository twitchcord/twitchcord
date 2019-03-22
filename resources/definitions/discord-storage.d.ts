declare class Storage {
  /** Get value from storage */
  get(key: string, def?: string): any
  /** Set value in storage */
  set(key: string, val: any): void
  /** Remove value in storage */
  remove(key: string): void
  /** Clear the storage */
  clear(): void
}
export class ObjectStorage extends Storage {
  storage: { [key: string]: any }
}
/** An interface for `window.localStorage` */
export const impl: Storage
