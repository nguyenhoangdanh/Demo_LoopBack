import { ApplicationKeys } from '@mt-hrm/common';
import { PostgresDataSource } from '@mt-hrm/datasources';
import { Attendance, NotionPage, User } from '@mt-hrm/models';
import { IdType, TzCrudRepository } from '@lb/infra';
import { Getter, inject } from '@loopback/core';
import { BelongsToAccessor, repository } from '@loopback/repository';
import { UserRepository, NotionPageRepository } from '@mt-hrm/repositories';

export class AttendanceRepository extends TzCrudRepository<Attendance> {
  public readonly user: BelongsToAccessor<User, IdType>;
  public readonly notionPage: BelongsToAccessor<NotionPage, IdType>;

  constructor(
    @inject(`datasources.${ApplicationKeys.DS_POSTGRES}`)
    dataSource: PostgresDataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('NotionPageRepository')
    protected notionPageRepositoryGetter: Getter<NotionPageRepository>,
  ) {
    super(Attendance, dataSource);

    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
    this.registerInclusionResolver('user', this.user.inclusionResolver);

    this.notionPage = this.createBelongsToAccessorFor(
      'notionPage',
      notionPageRepositoryGetter,
    );
    this.registerInclusionResolver(
      'notionPage',
      this.notionPage.inclusionResolver,
    );
  }

  async updateAttendanceCheckOutTime(): Promise<
    Array<{
      id: number;
      user_id: number;
      check_out_time: string;
    }>
  > {
    const sqlStmt = `
      UPDATE "Attendance"
      SET check_out_time = date_trunc('day', created_at) + interval '16 hours 30 minutes'
      WHERE check_out_time is null
      RETURNING id, user_id, check_out_time;
    `;
    const result = await this.dataSource.execute(sqlStmt);

    return result?.rows;
  }
}
