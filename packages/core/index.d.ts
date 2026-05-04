import { IncomingMessage, ServerResponse } from 'http';

export interface ZerraRequest extends IncomingMessage {
  query: Record<string, string>;
  path: string;
  body: any;
  files: Array<{
    fieldname: string;
    filename: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
  }>;
  params: Record<string, string>;
}

export interface ZerraResponse extends ServerResponse {
  status(code: number): ZerraResponse;
  json(data: any): void;
  cors(options?: { origin?: string; methods?: string }): ZerraResponse;
}

export type ZerraHandler = (req: ZerraRequest, res: ZerraResponse) => void | Promise<void>;

export type ZerraMiddleware = (req: ZerraRequest, res: ZerraResponse, next: () => Promise<void>) => void | Promise<void>;

export interface ZerraConfig {
  features: {
    logging?: boolean;
    dynamicRouting?: boolean;
    
    middleware?: boolean;
    dotenv?: boolean;
    validation?: boolean;
    multipart?: boolean;
    errors?: boolean;
    dashboard?: boolean;
  };
  plugins?: string[];
}

export interface ZerraApp {
  use(fn: ZerraMiddleware): void;
  decorate(target: 'req' | 'res', name: string, fn: Function): void;
  config: ZerraConfig;
}

export function startServer(port?: number): void;
