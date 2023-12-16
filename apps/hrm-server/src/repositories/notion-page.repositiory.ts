import { ApplicationKeys } from '@mt-hrm/common';
import { PostgresDataSource } from '@mt-hrm/datasources';
import { Attendance, NotionPage } from '@mt-hrm/models';
import { AttendanceRepository } from '@mt-hrm/repositories';
import { IdType, TzCrudRepository } from '@lb/infra';
import { HasManyRepositoryFactory, repository } from '@loopback/repository';
import { Getter, inject } from '@loopback/core';

// ----------------------------------------------------------------------------
export class NotionPageRepository extends TzCrudRepository<NotionPage> {
  public readonly attendances: HasManyRepositoryFactory<Attendance, IdType>;

  constructor(
    @inject(`datasources.${ApplicationKeys.DS_POSTGRES}`)
    dataSource: PostgresDataSource,
    @repository.getter('AttendanceRepository')
    protected attendanceRepositoryGetter: Getter<AttendanceRepository>,
  ) {
    super(NotionPage, dataSource);

    this.attendances = this.createHasManyRepositoryFactoryFor(
      'attendances',
      attendanceRepositoryGetter,
    );
    this.registerInclusionResolver(
      'attendances',
      this.attendances.inclusionResolver,
    );
  }
}
