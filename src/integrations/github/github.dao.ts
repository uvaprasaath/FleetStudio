import { GithubApi } from './github.api';

interface CacheEntry {
  data: any;
  expiresAt: number;
}

export class GithubDao {
  // Static cache shared across all instances of GithubDao
  private static cache = new Map<string, CacheEntry>();
  private githubApi = new GithubApi();
  private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Retrieves commit data, checking the 5-minute cache first.
   */
  public async getCommitData(
    owner: string,
    repo: string,
    oid: string
  ): Promise<any> {
    const cacheKey = `${owner.toLowerCase()}/${repo.toLowerCase()}/${oid.toLowerCase()}`;
    const cached = GithubDao.cache.get(cacheKey);
    const now = Date.now();

    if (cached) {
      if (cached.expiresAt > now) {
        console.log(`[cache] Hit for key: ${cacheKey}`);
        return cached.data;
      } else {
        console.log(`[cache] Expired for key: ${cacheKey}. Evicting.`);
        GithubDao.cache.delete(cacheKey);
      }
    }

    console.log(`[cache] Miss/Expired for key: ${cacheKey}. Fetching from API.`);
    const data = await this.githubApi.fetchCommit(owner, repo, oid);

    // Cache the fetched data
    GithubDao.cache.set(cacheKey, {
      data,
      expiresAt: now + this.CACHE_DURATION_MS,
    });

    return data;
  }
}
