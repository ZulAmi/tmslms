export { auth, signIn, signOut, handlers } from "./auth";
export type { Session, User } from "next-auth";

// Re-export handlers as GET and POST for convenience
import { handlers } from "./auth";
export const { GET, POST } = handlers;
