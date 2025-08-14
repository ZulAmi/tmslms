import { ChangeSet, VersionCommit, UUID } from '../types';
export interface VersionControlService {
    commit(courseId: UUID, message: string, changes: ChangeSet, authorId: string): Promise<VersionCommit>;
    history(courseId: UUID): Promise<VersionCommit[]>;
    diff(courseId: UUID, from: string, to: string): Promise<ChangeSet>;
}
export declare class InMemoryVCS implements VersionControlService {
    private commits;
    commit(courseId: UUID, message: string, changes: ChangeSet, authorId: string): Promise<VersionCommit>;
    history(courseId: UUID): Promise<VersionCommit[]>;
    diff(_courseId: UUID, _from: string, _to: string): Promise<ChangeSet>;
}
