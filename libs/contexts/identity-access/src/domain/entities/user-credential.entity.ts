export interface UserCredentialState {
  readonly userAccountId: string;
  passwordHash: string;
  readonly createdAt: Date;
  updatedAt: Date;
}

export class UserCredential {
  private constructor(private readonly state: UserCredentialState) {}

  static create(input: {
    userAccountId: string;
    passwordHash: string;
  }): UserCredential {
    return new UserCredential({
      userAccountId: input.userAccountId,
      passwordHash: input.passwordHash,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  static rehydrate(input: {
    userAccountId: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserCredential {
    return new UserCredential({
      userAccountId: input.userAccountId,
      passwordHash: input.passwordHash,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt
    });
  }

  changePassword(newPasswordHash: string): void {
    this.state.passwordHash = newPasswordHash;
    this.state.updatedAt = new Date();
  }

  get userAccountId(): string {
    return this.state.userAccountId;
  }

  get passwordHash(): string {
    return this.state.passwordHash;
  }

  toPrimitives(): {
    userAccountId: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      userAccountId: this.state.userAccountId,
      passwordHash: this.state.passwordHash,
      createdAt: this.state.createdAt,
      updatedAt: this.state.updatedAt
    };
  }
}
