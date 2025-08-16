export { auth, signIn, signOut, handlers, authConfig } from './auth';
export { default } from './auth';
export type { Session, User } from 'next-auth';

// Re-export handlers as GET and POST for convenience
// For NextAuth v4, handlers is the same function for both GET and POST
import { handlers } from './auth';
export const GET = handlers;
export const POST = handlers;
