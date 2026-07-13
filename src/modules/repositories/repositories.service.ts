import { GithubDao } from '../../integrations/github/github.dao';
import { HttpException } from '../../helpers/httpexception';
import { Responsecode } from '../../helpers/responsecode';

export interface HunkLine {
  baseLineNumber: number | null;
  headLineNumber: number | null;
  content: string;
}

export interface Hunk {
  header: string;
  lines: HunkLine[];
}

export interface Signature {
  name: string;
  email: string;
  date: string;
  avatarUrl: string;
}

export interface SimplifiedCommit {
  oid: string;
  subject: string;
  body: string;
  parents: Array<{ oid: string }>;
  author: Signature;
  committer: Signature;
}

export interface DiffFile {
  changeKind: 'ADDED' | 'COPIED' | 'DELETED' | 'MODIFIED' | 'RENAMED' | 'TYPE_CHANGED';
  headFile: { path: string } | null;
  baseFile: { path: string } | null;
  hunks: Hunk[];
}

export class RepositoriesService {
  private githubDao = new GithubDao();

  /**
   * Fetches commit details via GithubDao and returns simplified commit metadata.
   */
  public async getCommit(
    owner: string,
    repo: string,
    oid: string
  ): Promise<SimplifiedCommit[]> {
    const data = await this.githubDao.getCommitData(owner, repo, oid);

    const rawMessage = data.commit?.message || '';
    const lines = rawMessage.split('\n');
    const subject = lines[0] || '';
    const body = lines.slice(1).join('\n').trim();

    const simplified: SimplifiedCommit = {
      oid: data.sha,
      subject,
      body,
      author: {
        name: data.commit?.author?.name || '',
        email: data.commit?.author?.email || '',
        date: data.commit?.author?.date || '',
        avatarUrl: data.author?.avatar_url || '',
      },
      committer: {
        name: data.commit?.committer?.name || '',
        email: data.commit?.committer?.email || '',
        date: data.commit?.committer?.date || '',
        avatarUrl: data.committer?.avatar_url || '',
      },
      parents: (data.parents || []).map((p: any) => ({ oid: p.sha })),
    };

    return [simplified];
  }

  /**
   * Fetches commit details via GithubDao and returns formatted file diffs.
   * If a filepath is provided, filters for that file and throws 404 if it's not present.
   */
  public async getDiff(
    owner: string,
    repo: string,
    oid: string,
    filepath?: string
  ): Promise<DiffFile[]> {
    const data = await this.githubDao.getCommitData(owner, repo, oid);
    const rawFiles: any[] = data.files || [];

    // Filter by filepath if provided
    let filesToProcess = rawFiles;
    if (filepath) {
      filesToProcess = rawFiles.filter(
        (f) => f.filename.toLowerCase() === filepath.toLowerCase()
      );

      if (filesToProcess.length === 0) {
        throw new HttpException(
          Responsecode.NOT_FOUND,
          `File path ${filepath} not found in this commit`
        );
      }
    }

    // Map files to DiffFile structure matching the enum and file constraints
    return filesToProcess.map((file) => {
      let changeKind: 'ADDED' | 'COPIED' | 'DELETED' | 'MODIFIED' | 'RENAMED' | 'TYPE_CHANGED' = 'MODIFIED';
      let headFile: { path: string } | null = null;
      let baseFile: { path: string } | null = null;

      // Status values in Github Commit API: "added", "removed", "modified", "renamed", "copied", "changed"
      if (file.status === 'added') {
        changeKind = 'ADDED';
        headFile = { path: file.filename };
        baseFile = null;
      } else if (file.status === 'removed') {
        changeKind = 'DELETED';
        headFile = null;
        baseFile = { path: file.filename };
      } else if (file.status === 'renamed') {
        changeKind = 'RENAMED';
        headFile = { path: file.filename };
        baseFile = { path: file.previous_filename || file.filename };
      } else if (file.status === 'copied') {
        changeKind = 'COPIED';
        headFile = { path: file.filename };
        baseFile = { path: file.previous_filename || file.filename };
      } else if (file.status === 'changed') {
        changeKind = 'TYPE_CHANGED';
        headFile = { path: file.filename };
        baseFile = { path: file.previous_filename || file.filename };
      } else {
        // Default / modified
        changeKind = 'MODIFIED';
        headFile = { path: file.filename };
        baseFile = { path: file.previous_filename || file.filename };
      }

      const hunks = file.patch ? this.parseGitPatch(file.patch) : [];

      return {
        changeKind,
        headFile,
        baseFile,
        hunks,
      };
    });
  }

  /**
   * Logic to parse unified diff patches into structured hunks and lines.
   */
  private parseGitPatch(patch: string): Hunk[] {
    if (!patch) return [];

    const patchLines = patch.split('\n');
    const hunks: Hunk[] = [];

    let currentHunk: Hunk | null = null;
    let baseLine = 0;
    let headLine = 0;

    for (const line of patchLines) {
      // Detect hunk header
      if (line.startsWith('@@')) {
        const match = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);

        if (!match) continue;

        baseLine = Number(match[1]);
        headLine = Number(match[2]);

        currentHunk = {
          header: line,
          lines: [],
        };

        hunks.push(currentHunk);
        continue;
      }

      // Ignore anything before the first hunk
      if (!currentHunk) continue;

      const prefix = line[0];
      const content = line.slice(1);

      switch (prefix) {
        case ' ':
          currentHunk.lines.push({
            baseLineNumber: baseLine,
            headLineNumber: headLine,
            content,
          });
          baseLine++;
          headLine++;
          break;

        case '-':
          currentHunk.lines.push({
            baseLineNumber: baseLine,
            headLineNumber: null,
            content,
          });
          baseLine++;
          break;

        case '+':
          currentHunk.lines.push({
            baseLineNumber: null,
            headLineNumber: headLine,
            content,
          });
          headLine++;
          break;

        case '\\':
          // Ignore "\ No newline at end of file"
          break;
      }
    }

    return hunks;
  }
}
