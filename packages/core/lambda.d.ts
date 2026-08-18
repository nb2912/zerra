import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda';

export interface LambdaHandlerOptions {
  apiDir?: string;
  corsOrigin?: string;
}

export interface RouteHandlerOptions {
  corsOrigin?: string;
}

/**
 * Create a universal Lambda handler that maps ANY route through Zerra's
 * file-based routing system. Deploy as a single Lambda behind API Gateway
 * with a catch-all route ({proxy+}).
 */
export function createLambdaHandler(
  options?: LambdaHandlerOptions
): (event: APIGatewayProxyEventV2, context: Context) => Promise<APIGatewayProxyResultV2>;

/**
 * Create a Lambda handler for a single, pre-loaded route module.
 * Use this for per-route Lambda deployments.
 */
export function routeHandler(
  handlerModule: any,
  options?: RouteHandlerOptions
): (event: APIGatewayProxyEventV2, context: Context) => Promise<APIGatewayProxyResultV2>;

export class LambdaRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  path: string;
  query: Record<string, string>;
  params: Record<string, string>;
  cookies: Record<string, string>;
  body: any;
  files: any[];
  id: string;
  user?: any;
  socket: { remoteAddress: string };
}

export class LambdaResponse {
  statusCode: number;
  status(code: number): LambdaResponse;
  setHeader(name: string, value: string): LambdaResponse;
  getHeader(name: string): string | undefined;
  writeHead(statusCode: number, headers?: Record<string, string>): LambdaResponse;
  write(chunk: string | Buffer): boolean;
  end(data?: string | Buffer): LambdaResponse;
  json(data: any): void;
  cors(options?: { origin?: string; methods?: string }): LambdaResponse;
  sendFile(filePath: string): void;
  redirect(url: string, status?: number): void;
  cache(ttlSeconds: number): LambdaResponse;
  toLambdaResponse(): APIGatewayProxyResultV2;
}
