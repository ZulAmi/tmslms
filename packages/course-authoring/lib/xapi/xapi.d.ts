import { XapiStatement } from '../types';
export interface XapiService {
    send(statement: XapiStatement): Promise<void>;
    batch(statements: XapiStatement[]): Promise<void>;
}
export declare class InMemoryXapiService implements XapiService {
    private store;
    send(statement: XapiStatement): Promise<void>;
    batch(statements: XapiStatement[]): Promise<void>;
}
