import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

type Bucket = { count: number; firstAt: number; lockedUntil?: number };

/**
 * In-process login throttling.
 * Two layers: per account+IP (10 attempts) and per IP (50 attempts) to limit
 * credential stuffing from a single source.
 *
 * NOTE: for multi-instance production deployments this must be backed by a
 * shared store (Redis) or an edge rate limiter.
 */
@Injectable()
export class LoginThrottleService {
  private buckets = new Map<string, Bucket>();
  private readonly windowMs = 15 * 60 * 1000;
  private readonly accountMax = 10;
  private readonly ipMax = 50;

  private check(key: string, max: number) {
    const b = this.buckets.get(key);
    if (!b) return;
    const now = Date.now();
    if (b.lockedUntil && b.lockedUntil > now) {
      throw new HttpException('Too many failed login attempts. Try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }
    if (now - b.firstAt > this.windowMs) this.buckets.delete(key);
  }

  private bump(key: string, max: number) {
    const now = Date.now();
    const b = this.buckets.get(key);
    if (!b || now - b.firstAt > this.windowMs) {
      this.buckets.set(key, { count: 1, firstAt: now });
      return;
    }
    b.count += 1;
    if (b.count >= max) b.lockedUntil = now + this.windowMs;
  }

  private accountKey(ip: string, email: string) {
    return `${ip || 'unknown'}|${(email || '').toLowerCase()}`;
  }

  private ipKey(ip: string) {
    return `ip|${ip || 'unknown'}`;
  }

  assertAllowed(ip: string, email: string) {
    this.check(this.accountKey(ip, email), this.accountMax);
    this.check(this.ipKey(ip), this.ipMax);
  }

  recordFailure(ip: string, email: string) {
    this.bump(this.accountKey(ip, email), this.accountMax);
    this.bump(this.ipKey(ip), this.ipMax);
  }

  recordSuccess(ip: string, email: string) {
    this.buckets.delete(this.accountKey(ip, email));
  }
}
