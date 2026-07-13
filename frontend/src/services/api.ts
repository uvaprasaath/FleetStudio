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

export interface HunkLine {
  baseLineNumber: number | null;
  headLineNumber: number | null;
  content: string;
}

export interface Hunk {
  header: string;
  lines: HunkLine[];
}

export interface DiffFile {
  changeKind: 'ADDED' | 'COPIED' | 'DELETED' | 'MODIFIED' | 'RENAMED' | 'TYPE_CHANGED';
  headFile: { path: string } | null;
  baseFile: { path: string } | null;
  hunks: Hunk[];
}

export interface ApiResponse<T> {
  header: {
    code: number;
  };
  body: {
    status: 'success' | 'error';
    message: string;
    data: T;
  };
}

const BASE_URL = 'http://localhost:5000/api/v1';

export async function getCommitDetails(
  owner: string,
  repo: string,
  oid: string
): Promise<SimplifiedCommit> {
  const url = `${BASE_URL}/repositories/${owner}/${repo}/commits/${oid}`;
  const response = await fetch(url);
  const json: ApiResponse<SimplifiedCommit[]> = await response.json();
  if (!response.ok || json.body.status === 'error') {
    throw new Error(json.body.message || 'Failed to fetch commit details');
  }
  if (!json.body.data || json.body.data.length === 0) {
    throw new Error('Commit not found');
  }
  return json.body.data[0];
}

export async function getCommitDiff(
  owner: string,
  repo: string,
  oid: string,
  path?: string
): Promise<DiffFile[]> {
  let url = `${BASE_URL}/repositories/${owner}/${repo}/commits/${oid}/diff`;
  if (path) {
    url += `?path=${encodeURIComponent(path)}`;
  }
  const response = await fetch(url);
  const json: ApiResponse<DiffFile[]> = await response.json();
  if (!response.ok || json.body.status === 'error') {
    throw new Error(json.body.message || 'Failed to fetch commit diff');
  }
  return json.body.data;
}
