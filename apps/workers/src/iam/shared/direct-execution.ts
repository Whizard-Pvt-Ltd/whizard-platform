declare const require: NodeRequire | undefined;
declare const module: NodeModule | undefined;

export const isDirectExecution = (): boolean => {
  if (typeof require === 'undefined' || typeof module === 'undefined') {
    return false;
  }

  return require.main === module;
};
