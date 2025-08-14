"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryXapiService = void 0;
class InMemoryXapiService {
    constructor() {
        this.store = [];
    }
    async send(statement) {
        this.store.push(statement);
    }
    async batch(statements) {
        this.store.push(...statements);
    }
}
exports.InMemoryXapiService = InMemoryXapiService;
