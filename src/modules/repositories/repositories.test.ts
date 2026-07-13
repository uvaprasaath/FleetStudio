/// <reference types="jest" />
import request from 'supertest';
import app from '../../index';
import { GithubApi } from '../../integrations/github/github.api';
import { Responsecode } from '../../helpers/responsecode';
import { GithubDao } from '../../integrations/github/github.dao';

// Mock the GithubApi module
jest.mock('../../integrations/github/github.api');

describe('Repositories Module Integration Tests', () => {
  let mockFetchCommit: jest.Mock;

  beforeEach(() => {
    // Clear and restore mocks
    jest.clearAllMocks();
    mockFetchCommit = GithubApi.prototype.fetchCommit as jest.Mock;
    
    // Clear GithubDao cache to prevent cross-test interference
    (GithubDao as any).cache.clear();
  });

  describe('GET /api/v1/repositories/:owner/:repository/commits/:oid', () => {
    it('should return simplified commit metadata on success', async () => {
      const mockCommitData = {
        sha: '7fd1a60b01f91b314f59955a4e4d4e80d8edf11d',
        commit: {
          message: 'Merge pull request #6 from Spaceghost/patch-1\n\nNew line at end of file.',
          author: {
            name: 'The Octocat',
            email: 'octocat@nowhere.com',
            date: '2012-03-06T23:06:50Z',
          },
          committer: {
            name: 'The Octocat',
            email: 'octocat@nowhere.com',
            date: '2012-03-06T23:06:50Z',
          },
        },
        parents: [
          { sha: '553c2077f0edc3d5dc5d17262f6aa498e69d6f8e' },
          { sha: '762941318ee16e59dabbacb1b4049eec22f0d303' },
        ],
        files: [],
      };

      mockFetchCommit.mockResolvedValue(mockCommitData);

      const res = await request(app)
        .get('/api/v1/repositories/octocat/Hello-World/commits/7fd1a60b01f91b314f59955a4e4d4e80d8edf11d')
        .expect(Responsecode.OK);

      expect(res.body.header.code).toBe(200);
      expect(res.body.body.status).toBe('success');
      expect(res.body.body.data).toBeInstanceOf(Array);
      expect(res.body.body.data).toHaveLength(1);
      
      const commit = res.body.body.data[0];
      expect(commit.oid).toBe(mockCommitData.sha);
      expect(commit.message).toBe(mockCommitData.commit.message);
      expect(commit.author.name).toBe(mockCommitData.commit.author.name);
      expect(commit.parents).toHaveLength(2);
      expect(commit.parents[0].oid).toBe('553c2077f0edc3d5dc5d17262f6aa498e69d6f8e');
    });

    it('should forward GitHub API errors correctly', async () => {
      mockFetchCommit.mockRejectedValue({
        status: 404,
        message: 'Commit not found',
      });

      const res = await request(app)
        .get('/api/v1/repositories/octocat/Hello-World/commits/invalid-sha')
        .expect(404);

      expect(res.body.header.code).toBe(404);
      expect(res.body.body.status).toBe('error');
      expect(res.body.body.message).toBe('Commit not found');
    });
  });

  describe('GET /api/v1/repositories/:owner/:repository/commits/:oid/diff', () => {
    const mockCommitWithFiles = {
      sha: '7fd1a60b01f91b314f59955a4e4d4e80d8edf11d',
      files: [
        {
          filename: 'README',
          status: 'modified',
          additions: 1,
          deletions: 1,
          changes: 2,
          patch: '@@ -1 +1 @@\n-Hello World!\n+Hello World!',
        },
        {
          filename: 'added-file.txt',
          status: 'added',
          additions: 5,
          deletions: 0,
          changes: 5,
          patch: '@@ -0,0 +1,5 @@\n+line 1\n+line 2',
        },
      ],
    };

    it('should return all file diffs mapped correctly when path is omitted', async () => {
      mockFetchCommit.mockResolvedValue(mockCommitWithFiles);

      const res = await request(app)
        .get('/api/v1/repositories/octocat/Hello-World/commits/7fd1a60b01f91b314f59955a4e4d4e80d8edf11d/diff')
        .expect(Responsecode.OK);

      expect(res.body.header.code).toBe(200);
      expect(res.body.body.data).toHaveLength(2);

      const file1 = res.body.body.data[0];
      expect(file1.changeKind).toBe('MODIFIED');
      expect(file1.headFile.path).toBe('README');
      expect(file1.baseFile.path).toBe('README');
      expect(file1.hunks).toBeInstanceOf(Array);

      const file2 = res.body.body.data[1];
      expect(file2.changeKind).toBe('ADDED');
      expect(file2.headFile.path).toBe('added-file.txt');
      expect(file2.baseFile).toBeNull();
    });

    it('should return only the filtered file when path param is provided', async () => {
      mockFetchCommit.mockResolvedValue(mockCommitWithFiles);

      const res = await request(app)
        .get('/api/v1/repositories/octocat/Hello-World/commits/7fd1a60b01f91b314f59955a4e4d4e80d8edf11d/diff?path=README')
        .expect(Responsecode.OK);

      expect(res.body.body.data).toHaveLength(1);
      expect(res.body.body.data[0].headFile.path).toBe('README');
    });

    it('should return 404 if the path param refers to a file not present in the commit', async () => {
      mockFetchCommit.mockResolvedValue(mockCommitWithFiles);

      const res = await request(app)
        .get('/api/v1/repositories/octocat/Hello-World/commits/7fd1a60b01f91b314f59955a4e4d4e80d8edf11d/diff?path=missing-file.txt')
        .expect(404);

      expect(res.body.header.code).toBe(404);
      expect(res.body.body.message).toBe('File path missing-file.txt not found in this commit');
    });
  });
});
