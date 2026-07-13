import { HttpException } from '../../helpers/httpexception';
import { Responsecode } from '../../helpers/responsecode';

export class GithubApi {
  /**
   * Fetches raw commit details (including files list and unified diff patches) from GitHub.
   */
  public async fetchCommit(
    owner: string,
    repo: string,
    oid: string
  ): Promise<any> {
    const token = process.env.GITHUB_TOKEN;
    const url = `https://api.github.com/repos/${owner}/${repo}/commits/${oid}`;

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'Node-Express-Server',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response;
    try {
      response = await fetch(url, { headers });
    } catch (error: any) {
      throw new HttpException(
        Responsecode.INTERNAL_SERVER_ERROR,
        `Network error: Failed to fetch from GitHub API: ${error.message}`
      );
    }

    if (!response.ok) {
      let errorMessage = '';
      switch (response.status) {
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 409:
          errorMessage = 'Conflict';
          break;
        case 422:
          errorMessage = 'Validation failed, or the endpoint has been spammed.';
          break;
        case 500:
          errorMessage = 'Internal Error';
          break;
        case 503:
          errorMessage = 'Service unavailable';
          break;
        default:
          try {
            const errorBody = (await response.json()) as any;
            errorMessage = errorBody.message || `Failed to fetch commit from GitHub (HTTP ${response.status})`;
          } catch {
            errorMessage = `Failed to fetch commit from GitHub (HTTP ${response.status})`;
          }
          break;
      }
      throw new HttpException(response.status, errorMessage);
    }

    return await response.json();
  }
}
