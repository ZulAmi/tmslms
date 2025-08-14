"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryVCS = void 0;
class InMemoryVCS {
    constructor() {
        this.commits = [];
    }
    async commit(courseId, message, changes, authorId) {
        const commit = {
            id: crypto.randomUUID(),
            courseId,
            message,
            authorId,
            timestamp: new Date(),
            changes,
        };
        this.commits.push(commit);
        return commit;
    }
    async history(courseId) {
        return this.commits.filter((c) => c.courseId === courseId);
    }
    async diff(_courseId, _from, _to) {
        return { added: [], modified: [], removed: [] };
    }
}
exports.InMemoryVCS = InMemoryVCS;
