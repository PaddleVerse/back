import { Injectable } from '@nestjs/common';

@Injectable()
export class BlacklistService {
  private readonly blacklistedTokens: Set<string> = new Set();

  addToBlacklist(token: string) {
    this.blacklistedTokens.add(token);
  }

  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }
}
