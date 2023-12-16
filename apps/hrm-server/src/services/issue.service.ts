import {
  IssueAssigneeRepository,
  IssueRepository,
  IssueTagRepository,
  StatusRepository,
  TypeRepository,
  UserRepository,
} from '@mt-hrm/repositories';
import {
  BaseService,
  UserRole,
  Role,
  NumberIdType,
  getError,
  dayjs,
} from '@lb/infra';
import { inject, Getter, service } from '@loopback/core';
import { IsolationLevel, repository } from '@loopback/repository';
import {
  MigrationTypeCode,
  MigrationStatusCode,
  FixedUserRoles,
} from '@mt-hrm/common';
import { SecurityBindings, UserProfile } from '@loopback/security';
import { Issue, IssueReq, IssueTag, User } from '@mt-hrm/models';
import _ from 'lodash';

export class IssueService extends BaseService {
  constructor(
    @repository(IssueRepository)
    private issueRepository: IssueRepository,
    @repository(StatusRepository)
    private statusRepository: StatusRepository,
    @repository(TypeRepository)
    private typeRepository: TypeRepository,
    @repository(UserRepository)
    private userRepository: UserRepository,
    @repository(IssueAssigneeRepository)
    private issueAssigneeRepository: IssueAssigneeRepository,
    @repository(IssueTagRepository)
    private issueTagRepository: IssueTagRepository,
    @inject.getter(SecurityBindings.USER, { optional: true })
    private getCurrentUser: Getter<UserProfile>,
  ) {
    super({ scope: IssueService.name });
  }

  getRepository() {
    return this.issueRepository;
  }

  async updateIssue(
    issueId: NumberIdType,
    requestedIssue: Partial<IssueReq>,
  ): Promise<any> {
    const currentIssue = await this.issueRepository.findById(issueId, {
      include: ['type', 'author'],
    });

    const isValidUpdateRequest = await this.validateUpdateIssueRequest(
      currentIssue,
      requestedIssue,
    );

    if (!isValidUpdateRequest) {
      return null;
    }

    // const transaction = await this.issueRepository.beginTransaction(
    //   IsolationLevel.READ_COMMITTED,
    // );

    if (requestedIssue.assigneeIds) {
      await this.issueAssigneeRepository.deleteAll({
        principalType: Issue.name,
        principalId: issueId,
      });

      const newIssueAssignees = requestedIssue.assigneeIds.map(
        newAssigneeId => ({
          principalId: issueId,
          principalType: Issue.name,
          createdAt: new Date(),
          modifiedAt: new Date(),
          assigneeId: newAssigneeId,
        }),
      );

      await this.issueAssigneeRepository.createAll(newIssueAssignees);
    }

    if (requestedIssue.tagIds) {
      await this.issueTagRepository.deleteAll({
        principalId: issueId,
        principalType: Issue.name,
      });

      const newIssueTag = requestedIssue.tagIds.map(newTagId => ({
        principalId: issueId,
        principalType: Issue.name,
        createdAt: new Date(),
        modifiedAt: new Date(),
        tagId: newTagId,
      }));

      await this.issueTagRepository.createAll(newIssueTag);
    }

    if (requestedIssue.requestDate) {
      const convertedRequestDate = dayjs(requestedIssue.requestDate).toDate();
      requestedIssue.requestDate = convertedRequestDate;
    }

    const mergedIssue = { ...currentIssue, ...requestedIssue };
    const updatedIssue = _.omit(mergedIssue, ['type', 'author']);

    return await this.issueRepository.updateById(currentIssue.id, updatedIssue);
  }

  private async validateUpdateIssueRequest(
    currentIssue: any,
    requestedIssue: Partial<IssueReq>,
  ): Promise<boolean> {
    let returnResult = true;

    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw getError({ message: 'Invalid user', statusCode: 400 });
    }

    // const currentIssue = await this.issueRepository.findById(issueId, {
    //   include: ['status'],
    // });

    // the statuses that the employee can't change to anything else
    const unchangeableStatusEmployee = await this.statusRepository.find({
      fields: ['id'],
      where: {
        code: {
          inq: [
            MigrationStatusCode.COMPLETED,
            MigrationStatusCode.CANCELED,
            MigrationStatusCode.CLOSE,
          ],
        },
      },
    });

    // The statuses that the employee still can change to
    const legalStatusRequestEmployee = await this.statusRepository.find({
      fields: ['id'],
      where: {
        code: {
          inq: [MigrationStatusCode.CLOSE],
        },
      },
    });

    // Check permissions of employee role
    const existingRoles = await this.userRepository
      .roles(currentUser?.userId)
      .find();

    if (
      existingRoles.some(role => role.identifier === FixedUserRoles.EMPLOYEE)
    ) {
      // Check if user is the author of the request
      if (currentUser?.userId !== currentIssue?.authorId) {
        throw getError({ message: 'Access denined', statusCode: 403 });
      }
      // Check the current status of issue
      if (
        unchangeableStatusEmployee.find(
          status => status.id === currentIssue?.statusId,
        )
      ) {
        throw getError({ message: 'Invalid update request', statusCode: 400 });
      }

      // Check the updating status
      if (requestedIssue.statusId) {
        if (
          !legalStatusRequestEmployee.find(
            status => status.id === requestedIssue.statusId,
          )
        ) {
          throw getError({ message: 'Invalid status', statusCode: 400 });
        }
      }

      // Check the updating assignees
      if (requestedIssue.assigneeIds) {
        const isValid = await this.isValidAssignees(
          currentUser,
          existingRoles,
          requestedIssue.assigneeIds,
        );
        if (!isValid) {
          throw getError({ message: 'Invalid assignee', statusCode: 400 });
        }
      }
    }

    return returnResult;
  }

  async isValidAssignees(
    currentUser: UserProfile,
    currentUserRoles: Role[],
    assigneeIds: number[],
  ) {
    // Find all users have higher roles
    const { identifier } = currentUserRoles.reduce((a, b) =>
      a.identifier > b.identifier ? b : a,
    );

    const filterHigherRoleUsers = await this.userRepository.find({
      include: [
        {
          relation: 'profile',
        },
        {
          relation: 'roles',
          scope: {
            where: {
              identifier: {
                gt: identifier,
              },
            },
          },
        },
      ],
      where: {
        id: {
          neq: currentUser?.userId,
        },
      },
    });
    const higherRoleUserIds = filterHigherRoleUsers.filter(
      (user: User) => user.roles.length > 0,
    );

    // Check that the assignee is a valid value
    const higherRoleUserIdSet = new Set(higherRoleUserIds.map(user => user.id));
    if (assigneeIds.find(id => higherRoleUserIdSet.has(id)) !== undefined) {
      return true;
    }

    return false;
  }
}
