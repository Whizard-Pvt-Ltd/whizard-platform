export interface MfaChallengeConfig {
  readonly challengeTtlSeconds: number;
  readonly codeLength: number;
}

export const defaultMfaChallengeConfig: MfaChallengeConfig = {
  challengeTtlSeconds: 300,
  codeLength: 6
};
