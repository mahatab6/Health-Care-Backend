export interface TErrorSources {
  path: string;
  message: string;
}

export interface IErrorResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  errorSources?: TErrorSources[];
  error?: unknown;
}