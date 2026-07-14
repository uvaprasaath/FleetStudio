import { Router } from 'express';
import { RepositoriesController } from './repositories.controller';
import { validateOid } from '../../middleware/validation.middleware';

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
      validateOid,
      this.repositoriesController.getCommit
    );
    this.router.get(
      '/:owner/:repository/commits/:oid/diff',
      validateOid,
      this.repositoriesController.getDiff
    );
  }
}
