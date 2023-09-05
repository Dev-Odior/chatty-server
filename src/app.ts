import express, { Express } from 'express';
import { ChattyServer } from './setupServer';
import { config } from './config';
import databaseConnection from './setUpDatabase';

class Application {
  public initialize(): void {
    this.loadConfig();
    databaseConnection();
    const app: Express = express();
    const server: ChattyServer = new ChattyServer(app);
    server.start();
  }

  private loadConfig(): void {
    config.validateConfig();
    config.cloudinaryConfig();
  }
}

const app = new Application();
app.initialize();
