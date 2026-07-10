export type ExecAsyncParams = {
  name?: string,
  statement: string,
  params?: Record<string, unknown>,
};