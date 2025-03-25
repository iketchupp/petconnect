export * from './user';
export * from './pet';
export * from './address';
export * from './shelter';

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors: {
    field: string;
    message: string;
  }[];
}
