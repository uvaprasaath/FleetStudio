import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../helpers/customresponse';
import { Responsecode } from '../../helpers/responsecode';
import { DiffFile, RepositoriesService } from './repositories.service';

export class RepositoriesController {
  private repositoriesService = new RepositoriesService();

  /**
   * GET /repositories/:owner/:repository/commits/:oid
   */
  public getCommit = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { owner, repository, oid } = req.params;
    
    try {
      const result = await this.repositoriesService.getCommit(
        owner as string,
        repository as string,
        oid as string
      );

      res
        .status(Responsecode.OK)
        .json(
          ApiResponse.success(
            Responsecode.OK,
            result,
            'Commit details retrieved successfully'
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /repositories/:owner/:repository/commits/:oid/diff
   */
  public getDiff = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { owner, repository, oid } = req.params;
    const path = req.query.path as string | undefined;

    try {
      const result: DiffFile[] = await this.repositoriesService.getDiff(
        owner as string,
        repository as string,
        oid as string,
        path
      );

      res
        .status(Responsecode.OK)
        .json(
          ApiResponse.success<DiffFile[]>(
            Responsecode.OK,
            result,
            'Commit diff retrieved successfully'
          )
        );
    } catch (error) {
      next(error);
    }
  };
}
