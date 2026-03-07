export interface IamTransactionContext {
  readonly transactionId: string;
}

export interface IamUnitOfWorkPort {
  execute<T>(work: (tx: IamTransactionContext) => Promise<T>): Promise<T>;
}
