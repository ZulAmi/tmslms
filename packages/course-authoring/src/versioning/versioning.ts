import { ChangeSet, VersionCommit, UUID } from '../types';

export interface VersionControlService {
  commit(courseId: UUID, message: string, changes: ChangeSet, authorId: string): Promise<VersionCommit>;
  history(courseId: UUID): Promise<VersionCommit[]>;
  diff(courseId: UUID, from: string, to: string): Promise<ChangeSet>;
}

export class InMemoryVCS implements VersionControlService {
  private commits: VersionCommit[] = [];

  async commit(courseId: UUID, message: string, changes: ChangeSet, authorId: string): Promise<VersionCommit> {
    const commit: VersionCommit = {
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

  async history(courseId: UUID): Promise<VersionCommit[]> {
    return this.commits.filter((c) => c.courseId === courseId);
  }

  async diff(_courseId: UUID, _from: string, _to: string): Promise<ChangeSet> {
    return { added: [], modified: [], removed: [] };
  }
}
