import { assertNonEmpty } from './validation.util';

export class ResourceScope {
  private constructor(
    public readonly resourceType: string,
    public readonly scopeExpression: string
  ) {}

  static from(input: { resourceType: string; scopeExpression: string }): ResourceScope {
    return new ResourceScope(
      assertNonEmpty(input.resourceType, 'ResourceType'),
      assertNonEmpty(input.scopeExpression, 'ScopeExpression')
    );
  }
}
