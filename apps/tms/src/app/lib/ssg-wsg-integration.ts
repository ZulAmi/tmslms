import { NextRequest, NextResponse } from 'next/server';

// Minimal service interfaces required by current API route usage
interface ErrorHandlerService {
  executeWithRetry<T>(
    fn: () => Promise<T>,
    meta?: Record<string, any>
  ): Promise<{ success: true; result: T } | { success: false; error: string }>;
}

interface TransformerService {
  transform<TInput, TOutput = TInput>(
    data: TInput,
    mapping: string,
    options?: Record<string, any>
  ): Promise<
    { success: true; data: TOutput } | { success: false; error: string }
  >;
}

interface ApiClientService {
  post<T = any>(
    url: string,
    data?: any
  ): Promise<{ success: boolean; data: T }>;
  get<T = any>(url: string, params?: any): Promise<T>;
}

interface CacheService {
  set(key: string, value: any, _options?: Record<string, any>): Promise<void>;
  get<T = any>(key: string): Promise<T | null>;
  getOrSet<T = any>(
    key: string,
    fn: () => Promise<T>,
    _options?: Record<string, any>
  ): Promise<T>;
}

export interface SSGWSGServices {
  errorHandler: ErrorHandlerService;
  transformer: TransformerService;
  client: ApiClientService;
  cache: CacheService;
}

// Lightweight in-memory implementations (placeholder until real package wiring)
const memoryStore = new Map<string, any>();

const servicesSingleton: SSGWSGServices = {
  errorHandler: {
    async executeWithRetry(fn) {
      try {
        const result = await fn();
        return { success: true as const, result };
      } catch (e: any) {
        return {
          success: false as const,
          error: e?.message || 'Unknown error',
        };
      }
    },
  },
  transformer: {
    async transform(data: any) {
      // Pass-through mock transformation
      return { success: true as const, data } as any;
    },
  },
  client: {
    async post(url, data) {
      // Mock: assign id if not present
      const payload = { id: data?.id || `mock-${Date.now()}`, ...data, url };
      return { success: true, data: payload };
    },
    async get(url) {
      return { id: 'mock-id', url, fetchedAt: new Date().toISOString() } as any;
    },
  },
  cache: {
    async set(key, value) {
      memoryStore.set(key, { value, ts: Date.now() });
    },
    async get(key) {
      const entry = memoryStore.get(key);
      return entry ? entry.value : null;
    },
    async getOrSet(key, fn) {
      const existing = await this.get(key);
      if (existing) return existing;
      const created = await fn();
      await this.set(key, created);
      return created;
    },
  },
};

export function withSSGWSG<
  Handler extends (
    req: NextRequest,
    services: SSGWSGServices
  ) => Promise<Response | NextResponse>,
>(handler: Handler) {
  return async function wrapped(req: NextRequest) {
    try {
      return await handler(req, servicesSingleton);
    } catch (e: any) {
      console.error('withSSGWSG wrapper error', e);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

export default withSSGWSG;
