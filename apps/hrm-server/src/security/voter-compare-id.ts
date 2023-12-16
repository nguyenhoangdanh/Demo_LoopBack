import {
  AuthorizationContext,
  AuthorizationDecision,
} from '@loopback/authorization';

const compareHelper = (userId: number, queryId: string) => {
  return userId === Number(queryId)
    ? AuthorizationDecision.ALLOW
    : AuthorizationDecision.DENY;
};

export async function compareId(authorizationCtx: AuthorizationContext) {
  const currentUser = authorizationCtx.principals[0];
  const contextData = authorizationCtx.invocationContext;

  const query = contextData.args[0];
  const controllerDestination = authorizationCtx.resource.split('.')[0];
  switch (contextData.methodName) {
    case 'findById':
      if (controllerDestination === 'UserController') {
        return compareHelper(currentUser.userId, query);
      }
      break;
    case 'findAll':
      if (controllerDestination === 'IssueController') {
        return compareHelper(currentUser.userId, query?.where?.authorId);
      } else if (controllerDestination === 'AttendanceController') {
        return compareHelper(currentUser.userId, query?.where?.userId);
      }
      break;
    case 'findByUserId':
      return compareHelper(currentUser.userId, query);
    case 'getDayOff': {
      if (!query.userIds || query.userIds.length !== 1) {
        return AuthorizationDecision.DENY;
      }
      return compareHelper(currentUser.userId, query.userIds[0]);
    }
    default:
      break;
  }

  // Check authorization in infra
  return AuthorizationDecision.ABSTAIN;
}
