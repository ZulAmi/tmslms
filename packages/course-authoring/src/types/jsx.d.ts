/// <reference types="react" />
/// <reference types="styled-jsx" />

import type { HTMLAttributes } from 'react';

declare module 'react' {
  interface StyleHTMLAttributes<T> extends HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}
