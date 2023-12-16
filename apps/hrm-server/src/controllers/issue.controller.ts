import {
  EntityRelations,
  dayjs,
  defineCrudController,
  defineRelationCrudController,
  getError,
  IdType,
  Role,
  NumberIdType,
} from '@lb/infra';
import {
  Authentication,
  FixedUserRoles,
  ITotalData,
  MigrationStatusCode,
  MigrationStatusName,
  NotificationTypes,
  RestPaths,
} from '@mt-hrm/common';
import { authenticate } from '@loopback/authentication';
import { Getter, inject, service } from '@loopback/core';
import {
  api,
  get,
  del,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
  getFilterSchemaFor,
} from '@loopback/rest';
import { DataObject, Filter, FilterExcludingWhere } from '@loopback/repository';
import { Issue } from '@mt-hrm/models/entities/issue.model';
import { IssueRepository } from '@mt-hrm/repositories/issue.repository';
import { IssueAssignee, IssueTag, Tag, User } from '@mt-hrm/models';
import {
  StatusRepository,
  TagRepository,
  UserRepository,
} from '@mt-hrm/repositories';
import { IssueService } from '@mt-hrm/services';
import { NotificationActions, SagaHelper } from '@mt-hrm/helpers';
import { SecurityBindings, UserProfile } from '@loopback/security';
import { authorize } from '@loopback/authorization';
import { compareId } from '@mt-hrm/security/voter-compare-id';
import { IssueReq } from '@mt-hrm/models/request';
import { compare } from 'bcryptjs';

const Controller = defineCrudController({
  entity: Issue,
  repository: { name: IssueRepository.name },
  controller: { basePath: RestPaths.ISSUE },
});

@authorize({
  allowedRoles: [FixedUserRoles.SUPER_ADMIN, FixedUserRoles.ADMIN],
  voters: [compareId],
})
@authenticate(Authentication.STRATEGY_JWT)
@api({ basePath: RestPaths.ISSUE })
export class IssueController extends Controller {
  constructor(
    @inject('repositories.IssueRepository')
    private issueRepository: IssueRepository,
    @inject('repositories.UserRepository')
    private userRepository: UserRepository,
    @inject('repositories.StatusRepository')
    private statusRepository: StatusRepository,
    @inject.getter(SecurityBindings.USER, { optional: true })
    private getCurrentUser: Getter<UserProfile>,
    @service(IssueService)
    private issueService: IssueService,
  ) {
    super(issueRepository);
  }

  @get('/', {
    responses: {
      '200': {
        description: 'Array of Issue model instances',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                data: {
                  type: 'array',
                  items: getModelSchemaRef(Issue, {
                    includeRelations: true,
                  }),
                },
                total: { type: 'number' },
              },
            },
          },
        },
      },
    },
  })
  async findAll(
    @param.filter(Issue) filter?: Filter<Issue>,
  ): Promise<ITotalData<Issue>> {
    const { count: total } = await this.issueRepository.count(filter?.where);
    const roles = await this.issueRepository.find({
      ...filter,
      order: ['requestDate desc'],
    });
    return {
      total,
      data: roles,
    };
  }

  @get('/{id}', {
    responses: {
      '200': {
        description: `Find ${Issue.name} model instance`,
        content: {
          'application/json': {
            schema: getModelSchemaRef(Issue, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: IdType,
    @param.query.object(
      'filter',
      getFilterSchemaFor(Issue, { exclude: 'where' }),
    )
    filter?: FilterExcludingWhere<Issue>,
  ): Promise<Issue> {
    const res = await this.repository.findById(id, filter);

    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw getError({ message: 'Invalid user', statusCode: 400 });
    }
    // Check permissions of employee role
    const existingRoles = await this.userRepository
      .roles(currentUser?.userId)
      .find();

    if (
      existingRoles.some(role => role.identifier === FixedUserRoles.EMPLOYEE) &&
      currentUser?.userId !== res?.authorId
    ) {
      throw getError({ message: 'Access denied', statusCode: 403 });
    }
    return res;
  }

  @patch('{id}', {
    responses: {
      '200': {
        description: `Patch target for user information`,
        content: { 'application/json': {} },
      },
    },
  })
  async updateIssue(
    @param.path.number('id') issueId: number,
    @requestBody({
      required: true,
      content: {
        'application/json': {
          schema: getModelSchemaRef(IssueReq, {
            exclude: ['id', 'createdAt', 'modifiedAt'],
          }),
        },
      },
    })
    request: Partial<IssueReq>,
  ): Promise<any> {
    const {
      title,
      description,
      typeId,
      statusId,
      tagIds,
      assigneeIds,
      requestDate,
    } = request;

    // if (title) {
    //   await this.issueRepository.updateById(issueId, { title });
    // }
    // if (description) {
    //   await this.issueRepository.updateById(issueId, { description });
    // }
    //
    // if (statusId) {
    //   await this.issueRepository.updateById(issueId, { statusId });
    //   // if (completedId != undefined && statusId === completedId) {
    //   //   await this.issueService.updateSpentDayOffByStatusAndType(issueId);
    //   // }
    // }
    // if (typeId) {
    //   await this.issueRepository.updateById(issueId, { typeId });
    // }
    // if (requestDate) {
    //   const convertedRequestDate = dayjs(requestDate).toDate();
    //
    //   await this.issueRepository.updateById(issueId, {
    //     requestDate: convertedRequestDate,
    //   });
    // }
    // if (tagIds) {
    //   const existingTags = await this.issueRepository.tags(issueId).find();
    //   for (const tag of existingTags) {
    //     await this.issueRepository.tags(issueId).unlink(tag.id);
    //   }
    //   for (const tagId of tagIds) {
    //     await this.issueRepository.tags(issueId).link(tagId);
    //   }
    // }
    // if (assigneeIds) {
    //   const existingAssignees = await this.issueRepository
    //     .assignees(issueId)
    //     .find();
    //   for (const assignee of existingAssignees) {
    //     await this.issueRepository.assignees(issueId).unlink(assignee.id);
    //   }
    //   for (const assigneeId of assigneeIds) {
    //     await this.issueRepository.assignees(issueId).link(assigneeId);
    //   }
    // }

    SagaHelper.getInstance().dispatch({
      type: NotificationActions.OBSERVE_NOTIFICATION,
      payload: {
        type: NotificationTypes.MESSAGE,
        args: {
          action: 'issue',
          payload: {
            requestDate,
          },
        },
        error: 'issue socket failed',
      },
      log: true,
    });

    await this.issueService.updateIssue(issueId, request);

    const res = await this.issueRepository.findOne({ where: { id: issueId } });
    return res;
  }

  @del('/{id}', {
    responses: {
      '204': {},
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<any> {
    const { requestDate } = await this.repository.findById(id);
    await this.repository.deleteById(id);

    SagaHelper.getInstance().dispatch({
      type: NotificationActions.OBSERVE_NOTIFICATION,
      payload: {
        type: NotificationTypes.MESSAGE,
        args: {
          action: 'issue',
          payload: {
            requestDate,
          },
        },
        error: 'issue socket failed',
      },
      log: true,
    });

    return { message: 'Delete success', statusCode: '204' };
  }

  @post('/', {
    responses: {
      '200': {
        description: `Create ${Issue.name} model instance`,
        content: {
          'application/json': {
            schema: getModelSchemaRef(Issue),
          },
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(IssueReq, {
            title: `New ${IssueReq.name} payload`,
            exclude: ['id', 'createdAt', 'modifiedAt'],
          }),
        },
      },
    })
    data: Omit<IssueReq, 'id'>,
  ): Promise<Issue> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw getError({ message: 'Invalid user', statusCode: 400 });
    }
    const { assigneeIds, ...issue } = data;

    // Find next-up status
    const nextUpStatus = await this.statusRepository.findOne({
      fields: ['id'],
      where: {
        code: { eq: MigrationStatusCode.NEXT_UP },
      },
    });

    // Check that the assignee is a valid value
    const currentUserRoles = await this.userRepository
      .roles(currentUser?.userId)
      .find();
    if (
      assigneeIds &&
      currentUserRoles.some(role => role.identifier === FixedUserRoles.EMPLOYEE)
    ) {
      const isValid = await this.issueService.isValidAssignees(
        currentUser,
        currentUserRoles,
        assigneeIds,
      );
      if (!isValid) {
        throw getError({ message: 'Invalid assignee', statusCode: 400 });
      }
    }

    const rs = await this.repository.create({
      ...issue,
      statusId: nextUpStatus ? nextUpStatus.id : null,
      authorId: currentUser.userId,
    } as DataObject<Issue>);
    // const res = await this.issueRepository.findOne({ where: { id: rs.id } });
    if (assigneeIds) {
      for (const assigneeId of assigneeIds) {
        await this.issueRepository.assignees(rs.id).link(assigneeId);
      }
    }
    SagaHelper.getInstance().dispatch({
      type: NotificationActions.OBSERVE_NOTIFICATION,
      payload: {
        type: NotificationTypes.MESSAGE,
        args: {
          action: 'issue',
          payload: {
            requestDate: data.requestDate,
          },
        },
        error: 'issue socket failed',
      },
      log: true,
    });

    return rs;
  }
}

const IssueTagsRelationController = defineRelationCrudController<
  Issue,
  Tag,
  IssueTag
>({
  association: {
    source: Issue.name,
    relationName: 'tags',
    relationType: EntityRelations.HAS_MANY_THROUGH,
    target: Tag.name,
  },
  schema: {
    target: getModelSchemaRef(Tag, {
      exclude: ['id', 'createdAt', 'modifiedAt'],
    }),
  },
});

@authorize({ allowedRoles: [FixedUserRoles.SUPER_ADMIN, FixedUserRoles.ADMIN] })
@authenticate(Authentication.STRATEGY_JWT)
@api({ basePath: RestPaths.ISSUE })
export class IssueTagController extends IssueTagsRelationController {
  constructor(
    @inject('repositories.IssueRepository')
    issueRepository: IssueRepository,
    @inject('repositories.TagRepository')
    tagRepository: TagRepository,
  ) {
    super(issueRepository, tagRepository);
  }
}

const IssueAssigneeRelationController = defineRelationCrudController<
  Issue,
  User,
  IssueAssignee
>({
  association: {
    source: Issue.name,
    relationName: 'assignees',
    relationType: EntityRelations.HAS_MANY_THROUGH,
    target: User.name,
  },
  schema: {
    target: getModelSchemaRef(User, {
      exclude: ['id', 'createdAt', 'modifiedAt'],
    }),
  },
});

@authorize({ allowedRoles: [FixedUserRoles.SUPER_ADMIN, FixedUserRoles.ADMIN] })
@authenticate(Authentication.STRATEGY_JWT)
@api({ basePath: RestPaths.ISSUE })
export class IssueAssigneeController extends IssueAssigneeRelationController {
  constructor(
    @inject('repositories.IssueRepository')
    issueRepository: IssueRepository,
    @inject('repositories.UserRepository')
    userRepository: UserRepository,
  ) {
    super(issueRepository, userRepository);
  }
}
