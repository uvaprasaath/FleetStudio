import { Router } from 'express';
import { RepositoriesController } from './repositories.controller';

export class RepositoriesRouter {
  public path = 'repositories';
  public router = Router();
  private repositoriesController = new RepositoriesController();

  constructor() {
    this.init();
  }

  private init() {
    this.router.get(
      '/:owner/:repository/commits/:oid',
      this.repositoriesController.getCommit
    );
    this.router.get(
      '/:owner/:repository/commits/:oid/diff',
      this.repositoriesController.getDiff
    );
  }
}
