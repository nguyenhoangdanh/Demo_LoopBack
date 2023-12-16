import {
  ApplicationKeys,
  MigrationStatusCode,
  MigrationTypeCode,
  MigrationUser,
  PreferenceCodes,
  ReturnError,
} from '@mt-hrm/common';
import { PostgresDataSource } from '@mt-hrm/datasources';
import {
  getError,
  IdType,
  NumberIdType,
  TzCrudRepository,
  Role,
  UserRole,
  RoleRepository,
  UserRoleRepository,
} from '@lb/infra';
import { Getter, inject } from '@loopback/core';
import {
  HasManyRepositoryFactory,
  HasManyThroughRepositoryFactory,
  HasOneRepositoryFactory,
  repository,
} from '@loopback/repository';
import {
  Attendance,
  // ChangeUserProfile,
  Department,
  Position,
  User,
  UserCredential,
  UserDepartment,
  UserIdentifier,
  UserPosition,
  UserProfile,
  Preference,
  UserPreference,
  DayOffResponse,
} from '@mt-hrm/models';
import {
  AttendanceRepository,
  DepartmentRepository,
  PositionRepository,
  PreferenceRepository,
  UserCredentialRepository,
  UserDepartmentRepository,
  UserIdentifierRepository,
  UserPositionRepository,
  UserProfileRepository,
  UserPreferenceRepository,
} from '@mt-hrm/repositories';
import { IssueAssigneeRepository } from './issue-assignee.repository';
import { Issue } from '@mt-hrm/models/entities/issue.model';
import { IssueAssignee } from '@mt-hrm/models/entities/issue-assignee.model';
import { IssueRepository } from './issue.repository';
import departments from '@mt-hrm/migrations/data/departments';

export class UserRepository extends TzCrudRepository<User> {
  public readonly identifiers: HasManyRepositoryFactory<UserIdentifier, IdType>;
  public readonly credentials: HasManyRepositoryFactory<UserCredential, IdType>;
  public readonly profile: HasOneRepositoryFactory<UserProfile, IdType>;

  public readonly positions: HasManyThroughRepositoryFactory<
    Position,
    IdType,
    UserPosition,
    IdType
  >;
  public readonly roles: HasManyThroughRepositoryFactory<
    Role,
    IdType,
    UserRole,
    IdType
  >;
  public readonly departments: HasManyThroughRepositoryFactory<
    Department,
    IdType,
    UserDepartment,
    IdType
  >;
  public readonly attendances: HasManyRepositoryFactory<Attendance, IdType>;

  public readonly issues: HasManyRepositoryFactory<Issue, IdType>;

  public readonly issuesAssigned: HasManyThroughRepositoryFactory<
    Issue,
    IdType,
    IssueAssignee,
    IdType
  >;

  public readonly preferences: HasManyThroughRepositoryFactory<
    Preference,
    IdType,
    UserPreference,
    IdType
  >;

  constructor(
    @inject(`datasources.${ApplicationKeys.DS_POSTGRES}`)
    dataSource: PostgresDataSource,
    @repository.getter('UserIdentifierRepository')
    protected userIdentifierRepositoryGetter: Getter<UserIdentifierRepository>,
    @repository.getter('UserCredentialRepository')
    protected userCredentialRepositoryGetter: Getter<UserCredentialRepository>,
    @repository.getter('RoleRepository')
    protected roleRepositoryGetter: Getter<RoleRepository>,
    @repository.getter('UserRoleRepository')
    protected userRoleRepositoryGetter: Getter<UserRoleRepository>,
    @repository.getter('UserProfileRepository')
    protected userProfileRepositoryGetter: Getter<UserProfileRepository>,
    @repository.getter('DepartmentRepository')
    protected departmentRepositoryGetter: Getter<DepartmentRepository>,
    @repository.getter('UserDepartmentRepository')
    protected userDepartmentRepositoryGetter: Getter<UserDepartmentRepository>,
    @repository.getter('AttendanceRepository')
    protected attendanceRepositoryGetter: Getter<AttendanceRepository>,
    @repository.getter('PositionRepository')
    protected positionRepositoryGetter: Getter<PositionRepository>,
    @repository.getter('UserPositionRepository')
    protected userPositionRepositoryGetter: Getter<UserPositionRepository>,
    @repository.getter('IssueRepository')
    protected issueRepositoryGetter: Getter<IssueRepository>,
    @repository.getter('IssueAssigneeRepository')
    protected issueAssigneeRepositoryGetter: Getter<IssueAssigneeRepository>,

    @repository.getter('PreferenceRepository')
    protected preferenceRepositoryGetter: Getter<PreferenceRepository>,
    @repository.getter('UserPreferenceRepository')
    protected userPreferenceRepositoryGetter: Getter<UserPreferenceRepository>,

  ) {
    super(User, dataSource);

    this.credentials = this.createHasManyRepositoryFactoryFor(
      'credentials',
      userCredentialRepositoryGetter,
    );

    this.identifiers = this.createHasManyRepositoryFactoryFor(
      'identifiers',
      userIdentifierRepositoryGetter,
    );
    this.registerInclusionResolver(
      'identifiers',
      this.identifiers.inclusionResolver,
    );

    this.profile = this.createHasOneRepositoryFactoryFor(
      'profile',
      userProfileRepositoryGetter,
    );
    this.registerInclusionResolver('profile', this.profile.inclusionResolver);


    this.positions = this.createHasManyThroughRepositoryFactoryFor(
      'positions',
      positionRepositoryGetter,
      userPositionRepositoryGetter,
    );
    this.registerInclusionResolver(
      'positions',
      this.positions.inclusionResolver,
    );

    this.attendances = this.createHasManyRepositoryFactoryFor(
      'attendances',
      attendanceRepositoryGetter,
    );
    this.registerInclusionResolver(
      'attendances',
      this.attendances.inclusionResolver,
    );

    this.departments = this.createHasManyThroughRepositoryFactoryFor(
      'departments',
      departmentRepositoryGetter,
      userDepartmentRepositoryGetter,
    );
    this.registerInclusionResolver(
      'departments',
      this.departments.inclusionResolver,
    );

    this.roles = this.createHasManyThroughRepositoryFactoryFor(
      'roles',
      roleRepositoryGetter,
      userRoleRepositoryGetter,
    );
    this.registerInclusionResolver('roles', this.roles.inclusionResolver);

    this.issuesAssigned = this.createHasManyThroughRepositoryFactoryFor(
      'issuesAssigned',
      issueRepositoryGetter,
      issueAssigneeRepositoryGetter,
    );
    this.registerInclusionResolver(
      'issuesAssigned',
      this.issuesAssigned.inclusionResolver,
    );

    this.issues = this.createHasManyRepositoryFactoryFor(
      'issues',
      issueRepositoryGetter,
    );
    this.registerInclusionResolver('issues', this.issues.inclusionResolver);

    this.preferences = this.createHasManyThroughRepositoryFactoryFor(
      'preferences',
      preferenceRepositoryGetter,
      userPreferenceRepositoryGetter,
    );
    this.registerInclusionResolver(
      'preferences',
      this.preferences.inclusionResolver,
    );
  }

  // -----------------------------------------------------------------------------------------------------------------
  async getSignInCredential(opts: {
    userId: NumberIdType;
    identifierScheme: string;
    credentialScheme: string;
  }) {
    const { userId, identifierScheme, credentialScheme } = opts;
    const identifiers = await this.identifiers(userId).find({
      where: { scheme: identifierScheme },
    });

    const credentials = await this.credentials(userId).find({
      where: { scheme: credentialScheme },
    });

    return {
      userId,
      identifier: identifiers?.[0],
      credential: credentials?.[0],
    };
  }

  // -----------------------------------------------------------------------------------------------------------------
  async findCredential(opts: {
    userId: IdType;
    scheme: string;
    provider?: string;
  }): Promise<UserCredential | undefined> {
    const { userId, scheme, provider } = opts;
    try {
      const where: any = { scheme };

      if (provider) {
        where.provider = provider;
      }

      const credentials = await this.credentials(userId).find({ where });

      if (credentials?.length > 1) {
        throw getError({
          statusCode: 400,
          message: '[findCredential] Please specify credential provider!',
        });
      }

      return credentials?.[0];
    } catch (err) {
      if (err.code === 'ENTITY_NOT_FOUND') {
        return undefined;
      }

      throw err;
    }
  }

  // -----------------------------------------------------------------------------------------------------------------
  async getUserRoles(opts: { userId: NumberIdType }) {
    const { userId } = opts;

    const roleRepository = await this.roleRepositoryGetter();
    const userRoleRepository = await this.userRoleRepositoryGetter();

    const userRoles = await userRoleRepository.find({
      where: { userId, principalType: Role.name },
      fields: ['principalType', 'principalId'],
    });

    const roles = await Promise.all(
      userRoles.map((el: UserRole) =>
        roleRepository.findById(el.principalId as NumberIdType, {
          fields: ['id', 'identifier', 'name', 'priority', 'status'],
        }),
      ),
    );

    return roles;
  }

  // -----------------------------------------------------------------------------------------------------------------
  async assignRoles(opts: {
    userId: NumberIdType;
    roleIds?: NumberIdType[];
    roleIdentifiers?: string[];
  }) {
    const { userId, roleIds = [], roleIdentifiers = [] } = opts;

    const roleRepository = await this.roleRepositoryGetter();
    const userRoleRepository = await this.userRoleRepositoryGetter();

    if (roleIds?.length > 0) {
      for (const roleId of roleIds) {
        await userRoleRepository.upsertWith(
          {
            userId,
            principalId: roleId,
            principalType: 'Role',
          },
          {
            userId,
            roleId: roleId,
            principalType: 'Role',
          },
        );
      }
    }

    if (roleIdentifiers?.length > 0) {
      for (const roleIdentifier of roleIdentifiers) {
        const role = await roleRepository.findOne({
          where: { identifier: roleIdentifier },
        });
        await userRoleRepository.upsertWith(
          {
            userId,
            principalId: role.id,
            principalType: 'Role',
          },
          {
            userId,
            roleId: role.id,
            principalType: 'Role',
          },
        );
      }
    }
  }

  // -----------------------------------------------------------------------------------------------------------------
  async findUsersWithoutDepartments(): Promise<any> {
    const connector = this.dataSource.connector!;

    const userIdentifierRepository =
      await this.userIdentifierRepositoryGetter();
    const excludeUsers = await userIdentifierRepository.find({
      fields: { userId: true },
      where: {
        identifier: {
          inq: MigrationUser.MigrationList,
        },
      },
    });
    const excludeUserIds = excludeUsers.map(user => user.userId).join(', ');

    const sqlStmt = `
      SELECT "User"."status", "User"."id", "UserProfile"."full_name", "UserProfile"."avatar_image_url"
      FROM "User"
      LEFT JOIN "UserProfile" ON "User"."id" = "UserProfile"."user_id"
      WHERE "User"."id" NOT IN (
        SELECT "UserDepartment"."user_id"
        FROM "UserDepartment"
      )
      AND "User"."id" NOT IN (${excludeUserIds});
    `;

    return new Promise((resolve, reject) => {
      connector.execute!(sqlStmt, [], (err: Error | null, result: any[]) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  // -----------------------------------------------------------------------------------------------------------------
  async getFullDayOffRecords(
    userIds: number[],
    years: number[],
    limit: number,
    offset: number,
  ): Promise<DayOffResponse[]> {
    const userArr = await this.find({
      where: {
        id: {
          inq: [...userIds],
        },
      },
    });

    if (userArr.length !== userIds.length) {
      throw getError(ReturnError.INVALID_INPUT);
    }

    const sqlQuery = `
      WITH completed_status AS (
        SELECT id
        FROM "Status"
        WHERE code = $1
      ),

      completed_issue AS (
        SELECT I.author_id, I.type_id,
          EXTRACT(YEAR FROM I.request_date) AS year
        FROM "Issue" AS I
        WHERE I.status_id IN (SELECT id FROM completed_status)
      ),

      countable_type AS (
        SELECT id, code
        FROM "Type"
        WHERE code IN ($2, $3)
      ),

      day_off_record AS (
        SELECT ci.author_id, ci.year, ct.code, ct.id AS type_id, COUNT(*) AS val
        FROM completed_issue AS ci
        JOIN countable_type AS ct ON ci.type_id = ct.id
        GROUP BY ci.author_id, ci.year, ct.id, ct.code
      ),

      calculated_day_off AS (
        SELECT
          dr.author_id, dr.year,
          SUM(
            dr.val *
            CASE dr.code
              WHEN $4 THEN 1
              WHEN $5 THEN 0.5
            END
          ) AS spent_day_off
        FROM day_off_record AS dr
        GROUP BY dr.author_id, dr.year
      ),

      user_total_day_off AS (
        SELECT u.id AS user_id, up.effect_year as year, up.user_value AS total_value
        FROM "User" AS u
        JOIN "UserPreference" AS up
        ON u.id = up.user_id
        WHERE up.principal_type = 'full-days-off' AND up.effect_year = ANY($6) AND u.id = ANY($7)
      )

      SELECT utd.user_id, utd.year, utd.total_value AS total_day_off, cdo.spent_day_off
      FROM user_total_day_off AS utd
      LEFT JOIN calculated_day_off AS cdo
      ON utd.user_id = cdo.author_id AND utd.year = cdo.year
      ORDER BY utd.user_id ASC, utd.year DESC
      ;`;

      // LIMIT ${limit} OFFSET ${limit * offset}
    const queryPara = [
      MigrationStatusCode.COMPLETED,
      MigrationTypeCode.FULL_DAY_OFF,
      MigrationTypeCode.HALF_DAY_OFF,
      MigrationTypeCode.FULL_DAY_OFF,
      MigrationTypeCode.HALF_DAY_OFF,
      years,
      userIds,
    ];

    const items = await this.dataSource.execute(sqlQuery, queryPara);

    const result: DayOffResponse[] = items.map((item: any) => ({
      userId: item.user_id,
      year: item.year,
      totalDayOff: item.total_day_off,
      spentDayOff: item.spent_day_off || 0,
    }));

    return result;
  }
}
