import {
  Authentication,
  defineRelationCrudController,
  EntityRelations,
  FixedUserRoles,
  getError,
} from '@lb/infra';
import {
  Preference,
  User,
  UserPreference,
  UserPreferencesResponse,
  UserPreferencesSchema,
} from '@mt-hrm/models';
import {
  api,
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import { authorize } from '@loopback/authorization';
import { compareId } from '@mt-hrm/security/voter-compare-id';
import { authenticate } from '@loopback/authentication';
import { RestPaths, ReturnError } from '@mt-hrm/common';
import { repository, Where } from '@loopback/repository';
import {
  PreferenceRepository,
  UserPreferenceRepository,
  UserRepository,
} from '@mt-hrm/repositories';
import { service } from '@loopback/core';
import { UserPreferenceService } from '@mt-hrm/services';

const UserPreferenceRelationController = defineRelationCrudController<
  User,
  Preference,
  UserPreference
>({
  association: {
    source: User.name,
    relationName: 'preferences',
    relationType: EntityRelations.HAS_MANY_THROUGH,
    target: Preference.name,
  },
  schema: {
    target: getModelSchemaRef(User, {
      exclude: ['id', 'createdAt', 'modifiedAt'],
    }),
  },
});

@authorize({
  allowedRoles: [FixedUserRoles.SUPER_ADMIN, FixedUserRoles.ADMIN],
  voters: [compareId],
})
@authenticate(Authentication.STRATEGY_JWT)
@api({ basePath: RestPaths.USER })
export class UserPreferenceController extends UserPreferenceRelationController {
  constructor(
    @repository(UserPreferenceRepository)
    private userPreferenceRepository: UserPreferenceRepository,
    @service(UserPreferenceService)
    private userPreferenceService: UserPreferenceService,
    @repository(UserRepository)
    private userRepository: UserRepository,
    @repository(PreferenceRepository)
    private preferenceRepository: PreferenceRepository,
  ) {
    super(userRepository, preferenceRepository, userPreferenceRepository);
  }

  @get('/{id}/preferences', {
    responses: {
      '200': {
        description: 'Get the preferences record of the user',
      },
    },
    parameters: [
      {
        name: 'id',
        schema: { type: 'number' },
        in: 'path',
      },
      {
        name: 'filter',
        schema: {
          type: 'object',
          properties: {
            year: { type: 'number' },
            principalTypes: {
              type: 'array',
              items: { schema: { type: 'string' } },
            },
          },
        },
        in: 'query',
      },
    ],
  })
  findByUserId(
    @param.path.number('id', { required: true }) id: number,
    @param.query.object('filter')
    filter?: { year?: number; principalTypes?: string[] },
  ): Promise<UserPreferencesResponse[]> {
    if (!id) {
      throw getError(ReturnError.INVALID_INPUT);
    }

    const { year = new Date().getFullYear(), principalTypes = [] } =
      filter ?? {};

    let whereFilter: Where<UserPreference> = {
      userId: id,
      effectYear: year,
    };

    if (principalTypes.length) {
      whereFilter = { ...whereFilter, principalType: { inq: principalTypes } };
    }

    return this.userPreferenceRepository.find({
      where: whereFilter,
      fields: ['id', 'principalType', 'userValue', 'effectYear'],
    });
  }

  @patch('/{id}/preferences', {
    responses: {
      '200': {
        description: 'Change preferences value of a user',
      },
    },
  })
  updateById(
    @param.path.number('id', { required: true }) id: number,
    @requestBody({
      required: true,
      content: {
        'application/json': { schema: UserPreferencesSchema },
      },
    })
    payloads: {
      principalType: string;
      effectYear: number;
      userValue: number;
    }[],
  ) {
    if (!id || !payloads?.length) {
      throw getError(ReturnError.INVALID_INPUT);
    }

    return Promise.all(
      payloads.map(payload => {
        const { userValue, ...where } = payload;

        return this.userPreferenceRepository.upsertWith(payload, {
          userId: id,
          ...where,
        });
      }),
    );
  }

  @post('/{id}/preferences/{link_id}', {
    responses: {
      '200': {
        description: 'Create new preference for a user',
      },
    },
  })
  createUserPreferences(
    @param.path.number('id', { required: true }) id: number,
    @param.path.number('link_id', { required: true }) link_id: number,
    @requestBody({
      // content: {
      //   'application/json': {
      //     schema: {
      //       effectYear: { type: 'number' },
      //       userValue: { type: 'number' },
      //     },
      //   },
      // },
    })
    payload?: {
      effectYear: number;
      userValue: number;
    },
  ): Promise<UserPreference> {
    if (!id || !link_id) {
      throw getError(ReturnError.INVALID_INPUT);
    }

    return this.userPreferenceService.createNewUserPreference(
      id,
      link_id,
      payload?.effectYear,
      payload?.userValue,
    );
  }

  @del('/{id}/preferences/{link_id}', {
    responses: {
      '200': {
        description: 'Delete a user preference',
      },
    },
  })
  deleteUserPreference(
    @param.path.number('id', { required: true }) id: number,
    @param.path.number('link_id', { required: true }) link_id: number,
  ): Promise<any> {
    if (!id || !link_id) {
      throw getError(ReturnError.INVALID_INPUT);
    }

    return this.userPreferenceRepository.deleteAll({
      userId: id,
      principalId: link_id,
    });
  }

  @patch('/preferences/{link_id}', {
    responses: {
      '200': {
        description: 'Sync data from a preference to all users',
      },
    },
  })
  syncPreference(
    @param.path.number('link_id', { required: true }) link_id: number,
  ) {
    if (!link_id) {
      throw getError(ReturnError.INVALID_INPUT);
    }

    this.userPreferenceService.syncPreference(link_id);
  }
}
