export interface GlobalApiResponse<T = unknown> {
  responseTime: string;
  device: string;
  retCode: string;
  message: string;
  data: T | null;
}
