import preferenceInitialRecords from './preferences';
import {
  UserRepository,
  UserPreferenceRepository,
  PreferenceRepository,
} from '@mt-hrm/repositories';
import { EmployeeStatus, PreferenceCodes } from '@mt-hrm/common';
import { BaseApplication } from '@lb/infra';

export const generateArray = async (
  application: BaseApplication,
): Promise<
  Array<{
    userId: number;
    principalId: number;
    principalType: string;
    userValue: number;
    effectYear: number;
  }>
> => {
  const userRepository = application.getSync<UserRepository>(
    'repositories.UserRepository',
  );

  const preferenceRepository = application.getSync<PreferenceRepository>(
    'repositories.PreferenceRepository',
  );

  const users = await userRepository.find({
    fields: ['id', 'createdAt'],
    where: { status: EmployeeStatus.ACTIVATED },
  });

  const preferences = await preferenceRepository.find({
    fields: ['id', 'value', 'code'],
    where: {
      code: {
        neq: `${PreferenceCodes.PREFERENCE_PARKING_FEE_CODE}`,
      },
    },
  });

  const userArrWithYear = users.map(user => {
    const currentYear = new Date().getFullYear();
    const userCreatedYear = user.createdAt.getFullYear();
    let count = userCreatedYear;
    while (count <= currentYear) {
      const newRecord = {
        userId: user.id,
        effectYear: count,
      };
      count++;
      return newRecord;
    }
  });

  let userPreferenceArr: any[] = [];

  userArrWithYear.forEach(user => {
    preferences.forEach(preference => {
      userPreferenceArr.push({
        ...user,
        principalId: preference.id,
        principalType: preference.code.slice(3),
        userValue: preference.value,
      });
    });
  });

  return userPreferenceArr;
};
