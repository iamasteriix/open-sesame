export type RunAsyncParams = {
  name: string,
  statement: string,
  params?: Record<string, unknown>,
};

export type ExecAsyncParams = {
  name?: string,
  statement: string,
  params?: Record<string, unknown>,
};