import { XapiStatement } from '../types';

export interface XapiService {
  send(statement: XapiStatement): Promise<void>;
  batch(statements: XapiStatement[]): Promise<void>;
}

export class InMemoryXapiService implements XapiService {
  private store: XapiStatement[] = [];

  async send(statement: XapiStatement): Promise<void> {
    this.store.push(statement);
  }

  async batch(statements: XapiStatement[]): Promise<void> {
    this.store.push(...statements);
  }
}
