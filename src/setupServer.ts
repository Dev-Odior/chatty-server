import HTTP_STATUS from 'http-status-codes';
import { Application, NextFunction, Response, Request, json, urlencoded } from 'express';
import http from 'http';
import { config } from './config';
import hpp from 'hpp';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import cookieSession from 'cookie-session';
import applicationRoute from './routes';
import { CustomError, IErrorResponse } from './shared/globals/helpers/error-handler';
import Logger from 'bunyan';

import 'express-async-error';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';

const log: Logger = config.createLogger('setUpSever');

export class ChattyServer {
  public app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.globalErrorHandler(this.app);
    this.routesMiddleware(this.app);
    this.startSever(this.app);
  }

  private securityMiddleware(app: Application): void {
    app.use(hpp());
    app.use(helmet());

    app.use(
      cors({
        origin: config.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      })
    );
    app.use(
      cookieSession({
        name: 'session',
        keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
        maxAge: 24 * 7 * 3600,
        secure: config.NODE_ENV !== 'development'
      })
    );
  }

  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ limit: '50mb', extended: true }));
  }

  private globalErrorHandler(app: Application): void {
    app.use('*', (req: Request, res: Response) => {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found` });
    });

    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      if (error instanceof CustomError) {
        log.error(error);
        return res.status(error.statusCode).json(error.serializeError());
      }
      next();
    });
  }

  private routesMiddleware(app: Application): void {
    applicationRoute(app);
  }

  private async startSever(app: Application): Promise<void> {
    try {
      const httpServer = new http.Server(app);
      this.startHttpServer(httpServer);
      const socketIO: Server = await this.createSocketIo(httpServer);
      this.createSocketIo(httpServer);
      this.socketIOConnections(socketIO);
    } catch (error) {
      log.error(error);
    }
  }

  private startHttpServer(httpServer: http.Server): void {
    log.info(`Server has started with process ${process.pid}`);
    httpServer.listen(Number(config.PORT), () => {
      log.info(`Server is listening at port ${config.PORT}`);
    });
  }

  private async createSocketIo(httpServer: http.Server): Promise<Server> {
    const io: Server = new Server(httpServer, {
      cors: {
        origin: config.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      }
    });

    const pubClient = createClient({
      url: config.REDIS_HOST
    });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    return io;
  }

  private socketIOConnections(io: Server): void {}
}
