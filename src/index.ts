import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/config';
import { ApiResponse } from './helpers/customresponse';
import { CustomResponseCode, Responsecode } from './helpers/responsecode';
import { errorMiddleware } from './middleware/error.middleware';
import healthRoutes from './modules/health/health.routes';
import { RepositoriesRouter } from './modules/repositories/repositories.route';

const app = express();
const apiPrefix = '/api/v1';

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logger
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// API Routes
app.use('/api/health', healthRoutes);

const repositoriesRouter = new RepositoriesRouter();
app.use(`${apiPrefix}/${repositoriesRouter.path}`, repositoriesRouter.router);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(Responsecode.NOT_FOUND).json(
    ApiResponse.error(
      CustomResponseCode.ROUTE_NOT_FOUND.code,
      CustomResponseCode.ROUTE_NOT_FOUND.message
    )
  );
});

// Global Error Handler
app.use(errorMiddleware);

// Start Server
app.listen(config.port, () => {
  console.log(`[server]: Server is running at http://localhost:${config.port}`);
  console.log(`[server]: Environment is set to ${config.env}`);
});

export default app;
