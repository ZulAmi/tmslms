/**
 * Caching Service
 * Redis-based caching with TTL, cache invalidation, and performance monitoring
 */

import { EventEmitter } from 'events';
import {
  CacheConfig,
  CacheEntry,
  CacheMetrics,
  CacheInvalidationRule,
  InvalidationEvent,
  SerializationType,
  SystemEvent,
  SystemEventType,
} from '../types';

export interface CacheOptions {
  ttl?: number; // seconds
  tags?: string[];
  compress?: boolean;
  skipCache?: boolean;
  refreshOnAccess?: boolean;
}

export interface CacheStatistics {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  totalHits: number;
  totalMisses: number;
  averageResponseTime: number;
  memoryUsage: number;
  keyCount: number;
  expiredKeys: number;
  evictedKeys: number;
  lastResetTime: Date;
}

export interface CachePattern {
  pattern: string;
  description: string;
  defaultTTL: number;
  tags: string[];
  invalidationRules: CacheInvalidationRule[];
}

export class CacheService extends EventEmitter {
  private readonly config: CacheConfig;
  private readonly redis: any; // Redis client would be injected
  private readonly metrics: CacheMetrics;
  private readonly patterns: Map<string, CachePattern>;
  private readonly invalidationRules: Map<string, CacheInvalidationRule[]>;

  private requestCount = 0;
  private hitCount = 0;
  private missCount = 0;
  private totalResponseTime = 0;

  constructor(redisClient: any, config: Partial<CacheConfig> = {}) {
    super();

    this.redis = redisClient;
    this.config = {
      defaultTTL: 3600, // 1 hour
      maxTTL: 86400, // 24 hours
      keyPrefix: 'ssg_wsg_cache',
      namespace: 'default',
      compression: true,
      serialization: SerializationType.JSON,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };

    this.metrics = {
      hitRate: 0,
      missRate: 0,
      totalRequests: 0,
      totalHits: 0,
      totalMisses: 0,
      averageResponseTime: 0,
      memoryUsage: 0,
      keyCount: 0,
      expiredKeys: 0,
      evictedKeys: 0,
    };

    this.patterns = new Map();
    this.invalidationRules = new Map();
    this.initializeDefaultPatterns();
    this.startMetricsCollection();
  }

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  /**
   * Get a value from cache
   */
  async get<T = any>(
    key: string,
    options: CacheOptions = {}
  ): Promise<T | null> {
    if (options.skipCache) {
      return null;
    }

    const startTime = Date.now();
    this.requestCount++;

    try {
      const fullKey = this.buildKey(key);
      const cached = await this.redis.get(fullKey);

      const responseTime = Date.now() - startTime;
      this.totalResponseTime += responseTime;

      if (cached === null) {
        this.missCount++;
        this.updateMetrics();
        return null;
      }

      // Deserialize the data
      const entry: CacheEntry<T> = this.deserialize(cached);

      // Check if expired (Redis should handle this, but double-check)
      if (
        entry.ttl > 0 &&
        Date.now() > new Date(entry.createdAt).getTime() + entry.ttl * 1000
      ) {
        await this.delete(key);
        this.missCount++;
        this.updateMetrics();
        return null;
      }

      // Update access statistics
      entry.lastAccessed = new Date();
      entry.accessCount++;

      // Refresh TTL if requested
      if (options.refreshOnAccess && entry.ttl > 0) {
        await this.redis.expire(fullKey, entry.ttl);
      }

      // Update the cache entry with new access info
      await this.redis.set(fullKey, this.serialize(entry));

      this.hitCount++;
      this.updateMetrics();

      this.emitEvent({
        id: this.generateId(),
        type: SystemEventType.SYSTEM_ACTION,
        source: 'cache-service',
        data: {
          action: 'cache_hit',
          key,
          responseTime,
          accessCount: entry.accessCount,
        },
        timestamp: new Date(),
      });

      return entry.value;
    } catch (error: any) {
      this.missCount++;
      this.updateMetrics();

      this.emit('error', {
        operation: 'get',
        key,
        error: error.message,
        timestamp: new Date(),
      });

      return null;
    }
  }

  /**
   * Set a value in cache
   */
  async set<T = any>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key);
      const ttl = options.ttl || this.config.defaultTTL;
      const now = new Date();

      const entry: CacheEntry<T> = {
        key,
        value,
        ttl,
        createdAt: now,
        lastAccessed: now,
        accessCount: 0,
        size: this.calculateSize(value),
        tags: options.tags || [],
      };

      const serializedEntry = this.serialize(entry);

      if (ttl > 0) {
        await this.redis.setex(fullKey, ttl, serializedEntry);
      } else {
        await this.redis.set(fullKey, serializedEntry);
      }

      // Update tag mappings
      if (entry.tags.length > 0) {
        await this.updateTagMappings(key, entry.tags);
      }

      this.emitEvent({
        id: this.generateId(),
        type: SystemEventType.SYSTEM_ACTION,
        source: 'cache-service',
        data: {
          action: 'cache_set',
          key,
          ttl,
          size: entry.size,
          tags: entry.tags,
        },
        timestamp: new Date(),
      });

      return true;
    } catch (error: any) {
      this.emit('error', {
        operation: 'set',
        key,
        error: error.message,
        timestamp: new Date(),
      });

      return false;
    }
  }

  /**
   * Delete a value from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key);
      const result = await this.redis.del(fullKey);

      // Remove from tag mappings
      await this.removeFromTagMappings(key);

      this.emitEvent({
        id: this.generateId(),
        type: SystemEventType.SYSTEM_ACTION,
        source: 'cache-service',
        data: {
          action: 'cache_delete',
          key,
          deleted: result > 0,
        },
        timestamp: new Date(),
      });

      return result > 0;
    } catch (error: any) {
      this.emit('error', {
        operation: 'delete',
        key,
        error: error.message,
        timestamp: new Date(),
      });

      return false;
    }
  }

  /**
   * Check if a key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key);
      const result = await this.redis.exists(fullKey);
      return result === 1;
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Get or set a value (cache-aside pattern)
   */
  async getOrSet<T = any>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Not in cache, generate the value
    const value = await factory();

    // Store in cache for next time
    await this.set(key, value, options);

    return value;
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidateByPattern(pattern: string): Promise<number> {
    try {
      const fullPattern = this.buildKey(pattern);
      const keys = await this.redis.keys(fullPattern);

      if (keys.length === 0) {
        return 0;
      }

      const result = await this.redis.del(keys);

      this.emitEvent({
        id: this.generateId(),
        type: SystemEventType.SYSTEM_ACTION,
        source: 'cache-service',
        data: {
          action: 'cache_invalidate_pattern',
          pattern,
          keysDeleted: result,
        },
        timestamp: new Date(),
      });

      return result;
    } catch (error: any) {
      this.emit('error', {
        operation: 'invalidateByPattern',
        pattern,
        error: error.message,
        timestamp: new Date(),
      });

      return 0;
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    try {
      let totalDeleted = 0;

      for (const tag of tags) {
        const tagKey = this.buildTagKey(tag);
        const keys = await this.redis.smembers(tagKey);

        if (keys.length > 0) {
          const fullKeys = keys.map((key: string) => this.buildKey(key));
          const deleted = await this.redis.del(fullKeys);
          totalDeleted += deleted;

          // Remove the tag mapping
          await this.redis.del(tagKey);
        }
      }

      this.emitEvent({
        id: this.generateId(),
        type: SystemEventType.SYSTEM_ACTION,
        source: 'cache-service',
        data: {
          action: 'cache_invalidate_tags',
          tags,
          keysDeleted: totalDeleted,
        },
        timestamp: new Date(),
      });

      return totalDeleted;
    } catch (error: any) {
      this.emit('error', {
        operation: 'invalidateByTags',
        tags,
        error: error.message,
        timestamp: new Date(),
      });

      return 0;
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<boolean> {
    try {
      const pattern = this.buildKey('*');
      const keys = await this.redis.keys(pattern);

      if (keys.length > 0) {
        await this.redis.del(keys);
      }

      // Clear tag mappings
      const tagPattern = this.buildTagKey('*');
      const tagKeys = await this.redis.keys(tagPattern);
      if (tagKeys.length > 0) {
        await this.redis.del(tagKeys);
      }

      this.resetMetrics();

      this.emitEvent({
        id: this.generateId(),
        type: SystemEventType.SYSTEM_ACTION,
        source: 'cache-service',
        data: {
          action: 'cache_clear',
          keysDeleted: keys.length,
        },
        timestamp: new Date(),
      });

      return true;
    } catch (error: any) {
      this.emit('error', {
        operation: 'clear',
        error: error.message,
        timestamp: new Date(),
      });

      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getStatistics(): CacheStatistics {
    return {
      ...this.metrics,
      lastResetTime: new Date(), // This would be tracked properly
    };
  }

  /**
   * Reset cache metrics
   */
  resetMetrics(): void {
    this.requestCount = 0;
    this.hitCount = 0;
    this.missCount = 0;
    this.totalResponseTime = 0;

    Object.assign(this.metrics, {
      hitRate: 0,
      missRate: 0,
      totalRequests: 0,
      totalHits: 0,
      totalMisses: 0,
      averageResponseTime: 0,
      memoryUsage: 0,
      keyCount: 0,
      expiredKeys: 0,
      evictedKeys: 0,
    });
  }

  /**
   * Register a cache pattern
   */
  registerPattern(name: string, pattern: CachePattern): void {
    this.patterns.set(name, pattern);

    // Register invalidation rules
    if (pattern.invalidationRules.length > 0) {
      this.invalidationRules.set(name, pattern.invalidationRules);
    }
  }

  /**
   * Apply cache pattern to a key
   */
  async applyPattern<T>(
    patternName: string,
    key: string,
    factory: () => Promise<T>,
    customOptions: CacheOptions = {}
  ): Promise<T> {
    const pattern = this.patterns.get(patternName);
    if (!pattern) {
      throw new Error(`Cache pattern '${patternName}' not found`);
    }

    const options: CacheOptions = {
      ttl: pattern.defaultTTL,
      tags: pattern.tags,
      ...customOptions,
    };

    return this.getOrSet(key, factory, options);
  }

  /**
   * Handle cache invalidation events
   */
  async handleInvalidationEvent(
    event: InvalidationEvent,
    data: any
  ): Promise<void> {
    const rules = Array.from(this.invalidationRules.values()).flat();
    const applicableRules = rules.filter((rule) => rule.event === event);

    for (const rule of applicableRules) {
      try {
        if (rule.delay) {
          setTimeout(async () => {
            await this.executeInvalidationRule(rule, data);
          }, rule.delay);
        } else {
          await this.executeInvalidationRule(rule, data);
        }
      } catch (error: any) {
        this.emit('error', {
          operation: 'handleInvalidationEvent',
          event,
          rule: rule.pattern,
          error: error.message,
          timestamp: new Date(),
        });
      }
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private buildKey(key: string): string {
    return `${this.config.keyPrefix}:${this.config.namespace}:${key}`;
  }

  private buildTagKey(tag: string): string {
    return `${this.config.keyPrefix}:tags:${tag}`;
  }

  private serialize<T>(data: CacheEntry<T>): string {
    switch (this.config.serialization) {
      case SerializationType.JSON:
        return JSON.stringify(data);
      case SerializationType.MSGPACK:
        // Would use msgpack library
        return JSON.stringify(data);
      case SerializationType.PROTOBUF:
        // Would use protobuf library
        return JSON.stringify(data);
      default:
        return JSON.stringify(data);
    }
  }

  private deserialize<T>(data: string): CacheEntry<T> {
    switch (this.config.serialization) {
      case SerializationType.JSON:
        return JSON.parse(data);
      case SerializationType.MSGPACK:
        // Would use msgpack library
        return JSON.parse(data);
      case SerializationType.PROTOBUF:
        // Would use protobuf library
        return JSON.parse(data);
      default:
        return JSON.parse(data);
    }
  }

  private calculateSize(data: any): number {
    // Rough estimation of object size in bytes
    return JSON.stringify(data).length * 2; // UTF-16 encoding
  }

  private updateMetrics(): void {
    this.metrics.totalRequests = this.requestCount;
    this.metrics.totalHits = this.hitCount;
    this.metrics.totalMisses = this.missCount;
    this.metrics.hitRate =
      this.requestCount > 0 ? (this.hitCount / this.requestCount) * 100 : 0;
    this.metrics.missRate =
      this.requestCount > 0 ? (this.missCount / this.requestCount) * 100 : 0;
    this.metrics.averageResponseTime =
      this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0;
  }

  private async updateTagMappings(key: string, tags: string[]): Promise<void> {
    for (const tag of tags) {
      const tagKey = this.buildTagKey(tag);
      await this.redis.sadd(tagKey, key);
    }
  }

  private async removeFromTagMappings(key: string): Promise<void> {
    try {
      // Get the cached entry to find its tags
      const fullKey = this.buildKey(key);
      const cached = await this.redis.get(fullKey);

      if (cached) {
        const entry = this.deserialize(cached);
        for (const tag of entry.tags) {
          const tagKey = this.buildTagKey(tag);
          await this.redis.srem(tagKey, key);
        }
      }
    } catch (error) {
      // Ignore errors in cleanup
    }
  }

  private async executeInvalidationRule(
    rule: CacheInvalidationRule,
    data: any
  ): Promise<void> {
    await this.invalidateByPattern(rule.pattern);

    if (rule.cascade) {
      // Implement cascading invalidation logic here
      // This would invalidate related cache entries
    }
  }

  private initializeDefaultPatterns(): void {
    // SSG Schemes cache pattern
    this.registerPattern('ssg-schemes', {
      pattern: 'ssg:schemes:*',
      description: 'SSG funding schemes cache',
      defaultTTL: 7200, // 2 hours
      tags: ['ssg', 'schemes'],
      invalidationRules: [
        {
          pattern: 'ssg:schemes:*',
          event: InvalidationEvent.DATA_UPDATE,
          cascade: true,
          delay: 0,
        },
      ],
    });

    // WSG Courses cache pattern
    this.registerPattern('wsg-courses', {
      pattern: 'wsg:courses:*',
      description: 'WSG courses cache',
      defaultTTL: 3600, // 1 hour
      tags: ['wsg', 'courses'],
      invalidationRules: [
        {
          pattern: 'wsg:courses:*',
          event: InvalidationEvent.DATA_UPDATE,
          cascade: false,
          delay: 0,
        },
      ],
    });

    // Applications cache pattern
    this.registerPattern('applications', {
      pattern: 'applications:*',
      description: 'Funding applications cache',
      defaultTTL: 1800, // 30 minutes
      tags: ['applications'],
      invalidationRules: [
        {
          pattern: 'applications:*',
          event: InvalidationEvent.DATA_UPDATE,
          cascade: true,
          delay: 0,
        },
      ],
    });

    // Training providers cache pattern
    this.registerPattern('providers', {
      pattern: 'providers:*',
      description: 'Training providers cache',
      defaultTTL: 14400, // 4 hours
      tags: ['providers'],
      invalidationRules: [
        {
          pattern: 'providers:*',
          event: InvalidationEvent.DATA_UPDATE,
          cascade: false,
          delay: 0,
        },
      ],
    });
  }

  private startMetricsCollection(): void {
    setInterval(async () => {
      try {
        // Update memory usage
        const info = await this.redis.memory('usage');
        this.metrics.memoryUsage = info || 0;

        // Update key count
        const keyCount = await this.redis.dbsize();
        this.metrics.keyCount = keyCount || 0;
      } catch (error) {
        // Ignore errors in metrics collection
      }
    }, 60000); // Every minute
  }

  private emitEvent(event: SystemEvent): void {
    this.emit('systemEvent', event);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a cache service instance
 */
export function createCacheService(
  redisClient: any,
  config?: Partial<CacheConfig>
): CacheService {
  return new CacheService(redisClient, config);
}

/**
 * Create a cache key from components
 */
export function createCacheKey(
  namespace: string,
  ...components: (string | number)[]
): string {
  return [namespace, ...components.map((c) => String(c))].join(':');
}

/**
 * Wrap a function with caching
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  cacheService: CacheService,
  keyBuilder: (...args: Parameters<T>) => string,
  options: CacheOptions = {}
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyBuilder(...args);

    return cacheService.getOrSet(key, () => fn(...args), options);
  }) as T;
}

/**
 * Cache decorator factory
 */
export function Cache(
  keyBuilder: (...args: any[]) => string,
  options: CacheOptions = {}
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (this: any, ...args: any[]) {
      const cacheService = (this as any).cacheService || (this as any).cache;
      if (!cacheService) {
        return method.apply(this, args);
      }

      const key = keyBuilder(...args);
      return cacheService.getOrSet(
        key,
        () => method.apply(this, args),
        options
      );
    };

    return descriptor;
  };
}

/**
 * Time-based cache key with expiration
 */
export function createTimeBasedKey(
  base: string,
  intervalMinutes: number = 60
): string {
  const now = new Date();
  const interval = Math.floor(now.getTime() / (intervalMinutes * 60 * 1000));
  return `${base}:${interval}`;
}
