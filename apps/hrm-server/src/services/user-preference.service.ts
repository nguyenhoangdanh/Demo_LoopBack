import { BaseService } from '@lb/infra';
import { inject } from '@loopback/core';
import { InitailPreferencesCode, ReturnError } from '@mt-hrm/common';
import { User, Preference, UserPreference } from '@mt-hrm/models';
import {
  UserRepository,
  PreferenceRepository,
  UserPreferenceRepository,
} from '@mt-hrm/repositories';
import { UserService } from './user.service';
import { getError } from '@mt-hrm/utils/error.utility';

export class UserPreferenceService extends BaseService {
  constructor(
    @inject('repositories.UserRepository')
    private userRepository: UserRepository,
    @inject('repositories.PreferenceRepository')
    private preferenceRepository: PreferenceRepository,
    @inject('repositories.UserPreferenceRepository')
    private userPreferenceRepository: UserPreferenceRepository,
  ) {
    super({ scope: UserPreferenceService.name });
  }

  getRepository() {
    return this.userPreferenceRepository;
  }

  async createInitailPreferences(userId: number) {
    const initalPreferences = await this.preferenceRepository.find({
      where: {
        code: {
          inq: InitailPreferencesCode,
        },
      },
    });

    await Promise.all(
      initalPreferences.map(preference => {
        this.createNewUserPreference(userId, preference.id);
      }),
    );
  }

  async createNewUserPreference(
    userId: number,
    preferenceId: number,
    effectYear?: number,
    userValue?: number,
  ): Promise<UserPreference> {
    const checkRecord = await this.userPreferenceRepository.findOne({
      where: {
        userId: userId,
        principalId: preferenceId,
      },
    });

    if (checkRecord) {
      throw getError(ReturnError.INVALID_INPUT);
    }

    const preference = await this.preferenceRepository.findOne({
      where: { id: preferenceId },
    });

    const { code, value } = preference;

    const newYear = effectYear ?? new Date().getFullYear();
    const newValue = userValue ?? value;

    const newData = {
      createdAt: new Date(),
      modifiedAt: new Date(),
      principalId: preferenceId,
      principalType: code.slice(3),
      userId: userId,
      userValue: newValue,
      effectYear: newYear,
    };

    return await this.userPreferenceRepository.create(newData);
  }

  async syncPreference(preferenceId: number) {
    const preference = await this.preferenceRepository.findById(preferenceId);

    const { code, value } = preference;

    await this.userPreferenceRepository.updateAll(
      { userValue: value },
      {
        principalId: preferenceId,
        effectYear: new Date().getFullYear(),
      },
    );
  }
}
