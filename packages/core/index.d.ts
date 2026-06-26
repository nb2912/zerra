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
  cookies: Record<string, string>; // Feature 1: Parsed Cookies
  user?: any; // Populated by auth middleware, used by guards
}

export interface ZerraResponse extends ServerResponse {
  status(code: number): ZerraResponse;
  json(data: any): void;
  cors(options?: { origin?: string; methods?: string }): ZerraResponse;
  sendFile(filePath: string): void; // Feature 2: Send File helper
  redirect(url: string, status?: number): void; // Feature 3: Redirect helper
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
    static?: boolean; // Feature 4: Static File Serving
    rateLimiting?: boolean | { max: number; windowMs: number }; // Feature 5: Built-in Rate Limiting
    cron?: boolean; // Feature 6: Built-in Cron Job Scheduler
    guards?: boolean; // Feature: Declarative Route Guards (_guard.js)
    transforms?: boolean; // Feature: Response Transformers (_transform.js)
  };
  plugins?: string[];
}

export interface ZerraApp {
  use(fn: ZerraMiddleware): void;
  decorate(target: 'req' | 'res', name: string, fn: Function): void;
  config: ZerraConfig;
}

export function startServer(port?: number): void;

export interface ZerraGuard {
  require?: 'auth';
  roles?: string[];
  methods?: string[];
  check?: (req: ZerraRequest) => boolean | Promise<boolean>;
  message?: string;
}

export type ZerraTransformer = (data: any, req: ZerraRequest, res: ZerraResponse) => any;

export class ZerraError extends Error {
  status: number;
  constructor(status: number, message: string);
  static BadRequest(message?: string): ZerraError;
  static Unauthorized(message?: string): ZerraError;
  static Forbidden(message?: string): ZerraError;
  static NotFound(message?: string): ZerraError;
  static Conflict(message?: string): ZerraError;
  static Internal(message?: string): ZerraError;
}
