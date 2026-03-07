export const isDirectExecution = (metaUrl: string): boolean => {
  const entry = process.argv[1];
  if (!entry) {
    return false;
  }

  return metaUrl.endsWith(entry);
};
