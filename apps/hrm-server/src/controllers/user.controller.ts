import { Getter, inject } from '@loopback/core';
import {
  api,
  get,
  getModelSchemaRef,
  param,
  patch,
  requestBody,
} from '@loopback/rest';

import { Authentication, FixedUserRoles, RestPaths } from '@mt-hrm/common';
import {
  User,
  Department,
  UserDepartment,
  Position,
  UserPosition,
  Attendance,
  DayOffResponse,
} from '@mt-hrm/models';
import {
  AttendanceRepository,
  DepartmentRepository,
  PositionRepository,
  UserRepository,
} from '@mt-hrm/repositories';
import { UserService } from '@mt-hrm/services';
import {
  EntityRelations,
  defineCrudController,
  defineRelationCrudController,
  RoleRepository,
  getError,
} from '@lb/infra';
import { authenticate } from '@loopback/authentication';
import { Filter } from '@loopback/repository';
import { authorize } from '@loopback/authorization';
import { UpdateUserRequest, UpdateUserSchema } from '@mt-hrm/models/request';
import { compareId } from '@mt-hrm/security/voter-compare-id';
import { SecurityBindings, UserProfile } from '@loopback/security';

// ------------------------------------------------------------------------------
const Controller = defineCrudController({
  entity: User,
  repository: { name: UserRepository.name },
  controller: { basePath: RestPaths.USER },
});

@authorize({
  allowedRoles: [FixedUserRoles.SUPER_ADMIN, FixedUserRoles.ADMIN],
  voters: [compareId],
})
@authenticate(Authentication.STRATEGY_JWT)
@api({ basePath: RestPaths.USER })
export class UserController extends Controller {
  constructor(
    @inject('repositories.UserRepository')
    private userRepository: UserRepository,
    @inject('services.UserService')
    private userService: UserService,
    @inject('repositories.RoleRepository')
    private roleRepository: RoleRepository,
    @inject.getter(SecurityBindings.USER, { optional: true })
    private getCurrentUser: Getter<UserProfile>,
  ) {
    super(userRepository);
  }

  @get('/', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                data: {
                  type: 'array',
                  items: getModelSchemaRef(User, { includeRelations: true }),
                },
                total: { type: 'number' },
              },
            },
          },
        },
      },
    },
  })
  async findAll(@param.filter(User) filter?: Filter<User>) {
    const data = await this.repository.find(filter);
    const total = await this.repository.count(filter?.where);

    return {
      data,
      total: total.count,
    };
  }

  @get('/higher-roles', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                data: {
                  type: 'array',
                  items: getModelSchemaRef(User, { includeRelations: true }),
                },
                total: { type: 'number' },
              },
            },
          },
        },
      },
    },
  })
  async findHigherRoles(@param.filter(User) filter?: Filter<User>) {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw getError({ message: 'Invalid user', statusCode: 400 });
    }
    // get the lowest role of current user
    const existingRoles = await this.userRepository
      .roles(currentUser?.userId)
      .find();
    const { identifier } = existingRoles.reduce((a, b) =>
      a.identifier > b.identifier ? b : a,
    );

    const data = await this.repository.find({
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
      ...filter,
    });

    const res = data.filter((user: User) => user.roles.length > 0);
    return {
      data: res,
      total: res.length,
    };
  }

  @get('/not-in-departments', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(User, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async filterUsersNotInDepartments() {
    return await this.userRepository.findUsersWithoutDepartments();
  }

  @patch('{id}', {
    responses: {
      '200': {
        description: `Patch target for user information`,
        content: { 'application/json': {} },
      },
    },
  })
  async updateUser(
    @param.path.number('id') userId: number,
    @requestBody({
      required: true,
      content: {
        'application/json': { schema: UpdateUserSchema },
      },
    })
    request: UpdateUserRequest,
  ): Promise<any> {
    const { fullname, departments, positions, roles, status } = request;

    if (fullname) {
      await this.userRepository.profile(userId).patch({ fullName: fullname });
    }
    if (departments) {
      // Remove all existing department associations for the user
      const existingDepartments = await this.userRepository
        .departments(userId)
        .find();
      for (const department of existingDepartments) {
        await this.userRepository.departments(userId).unlink(department.id);
      }

      // Add the new department associations for the user
      for (const departmentId of departments) {
        await this.userRepository.departments(userId).link(departmentId);
      }
    }
    if (positions) {
      // Remove all existing position associations for the user
      const existingPositions = await this.userRepository
        .positions(userId)
        .find();
      for (const position of existingPositions) {
        await this.userRepository.positions(userId).unlink(position.id);
      }

      // Add the new position associations for the user
      for (const positionId of positions) {
        await this.userRepository.positions(userId).link(positionId);
      }
    }
    if (roles) {
      // Remove all existing role associations for the user
      const existingRoles = await this.userRepository.roles(userId).find();
      for (const role of existingRoles) {
        await this.userRepository.roles(userId).unlink(role.id);
      }

      // Add the new role associations for the user
      for (const roleIdentifier of roles) {
        const { id } = await this.roleRepository.findOne({
          where: { identifier: { eq: roleIdentifier } },
        });
        await this.userRepository.roles(userId).link(id);
      }
    }
    if (status) {
      await this.userRepository.updateById(userId, { status });
    }
  }

  @get('/days-off', {
    responses: {
      '200': {
        description: 'Get days-off record base on filter',
      },
    },
  })
  async getDayOff(
    @param.query.object('filter')
    filter: {
      userIds?: number[];
      years?: number[];
      limit?: number;
      offset?: number;
    },
  ): Promise<DayOffResponse[]> {
    return await this.userService.getDaysOff(filter);
  }
}

// ------------------------------------------------------------------------------
const BaseDepartmentRelationController = defineRelationCrudController<
  User,
  Department,
  UserDepartment
>({
  association: {
    source: User.name,
    relationName: 'departments',
    relationType: EntityRelations.HAS_MANY_THROUGH,
    target: Department.name,
  },
  schema: {
    target: getModelSchemaRef(Department, {
      exclude: ['id', 'createdAt', 'modifiedAt'],
    }),
  },
});

@authorize({ allowedRoles: [FixedUserRoles.SUPER_ADMIN, FixedUserRoles.ADMIN] })
@authenticate(Authentication.STRATEGY_JWT)
@api({ basePath: RestPaths.USER })
export class UserDepartmentController extends BaseDepartmentRelationController {
  constructor(
    @inject('repositories.UserRepository') userRepository: UserRepository,
    @inject('repositories.DepartmentRepository')
    departmentRepository: DepartmentRepository,
  ) {
    super(userRepository, departmentRepository);
  }
}

// ------------------------------------------------------------------------------
const BasePositionRelationController = defineRelationCrudController<
  User,
  Position,
  UserPosition
>({
  association: {
    source: User.name,
    relationName: 'positions',
    relationType: EntityRelations.HAS_MANY_THROUGH,
    target: Position.name,
  },
  schema: {
    target: getModelSchemaRef(Position, {
      exclude: ['id', 'createdAt', 'modifiedAt'],
    }),
  },
});

@authorize({ allowedRoles: [FixedUserRoles.SUPER_ADMIN, FixedUserRoles.ADMIN] })
@authenticate(Authentication.STRATEGY_JWT)
@api({ basePath: RestPaths.USER })
export class UserPositionController extends BasePositionRelationController {
  constructor(
    @inject('repositories.UserRepository') userRepository: UserRepository,
    @inject('repositories.PositionRepository')
    positionRepository: PositionRepository,
  ) {
    super(userRepository, positionRepository);
  }
}

// ------------------------------------------------------------------------------
const BaseAttendanceRelationController = defineRelationCrudController<
  User,
  Attendance,
  any
>({
  association: {
    source: User.name,
    relationName: 'attendances',
    relationType: EntityRelations.HAS_MANY,
    target: Attendance.name,
  },
  schema: {
    target: getModelSchemaRef(Attendance, {
      exclude: ['id', 'createdAt', 'modifiedAt', 'userId'],
    }),
  },
});

@authorize({
  allowedRoles: [FixedUserRoles.SUPER_ADMIN, FixedUserRoles.ADMIN],
  voters: [compareId],
})
@authenticate(Authentication.STRATEGY_JWT)
@api({ basePath: RestPaths.USER })
export class UserAttendanceController extends BaseAttendanceRelationController {
  constructor(
    @inject('repositories.UserRepository')
    private userRepository: UserRepository,
    @inject('repositories.AttendanceRepository')
    private attendanceRepository: AttendanceRepository,
  ) {
    super(userRepository, attendanceRepository);
  }

  @get('/{id}/attendances', {
    responses: {
      '200': {
        description: 'Array of Attendance model instances',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                data: {
                  type: 'array',
                  items: getModelSchemaRef(Attendance, {
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
  async findByUserId(
    @param.path.number('id') id: number,
    @param.filter(Attendance) filter?: Filter<Attendance>,
  ) {
    const data = await this.attendanceRepository.find({
      where: { userId: id },
      ...filter,
    });
    const total = await this.attendanceRepository.count(
      { userId: id },
      filter?.where,
    );

    return {
      data,
      total: total.count,
    };
  }
}
