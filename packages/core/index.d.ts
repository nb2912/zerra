import { IncomingMessage, ServerResponse } from 'http';
import type { Server } from 'http';

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
  cookies: Record<string, string>;
  user?: any;
  id?: string; // Set by request tracing feature
}

export interface ZerraResponse extends ServerResponse {
  status(code: number): ZerraResponse;
  json(data: any): void;
  cors(options?: { origin?: string; methods?: string }): ZerraResponse;
  sendFile(filePath: string): void;
  redirect(url: string, status?: number): void;
  cache(ttlSeconds: number): ZerraResponse; // Response caching helper
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
    static?: boolean;
    rateLimiting?: boolean | { max: number; windowMs: number };
    cron?: boolean;
    securityHeaders?: boolean;
    cors?: boolean;
    requestTracing?: boolean;
    guards?: boolean;
    transforms?: boolean;
  };
  cors?: { origin: string; methods: string };
  routePrefix?: string;
  maxBodySize?: number; // Max body size in MB (default: 1)
  plugins?: string[];
}

export interface ZerraApp {
  use(fn: ZerraMiddleware): void;
  decorate(target: 'req' | 'res', name: string, fn: Function): void;
  config: ZerraConfig;
}

export function startServer(port?: number): Server;

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
