import {
  PreferenceCodes,
  PreferenceDefaultValues,
  PreferenceDescriptions,
} from '@mt-hrm/common';

const preferenceInitialRecords: Array<{
  code: string;
  description: string;
  value: number;
}> = [
  {
    code: PreferenceCodes.PREFERENCE_FULL_DAYSOFF_CODE,
    description: PreferenceDescriptions.PREFERENCE_FULL_DAYSOFF_DESCRIPTION,
    value: PreferenceDefaultValues.PREFERENCE_FULL_DAYSOFF_VALUE,
  },
  {
    code: PreferenceCodes.PREFERENCE_HALF_DAYOFF_CODE,
    description: PreferenceDescriptions.PREFERENCE_HALF_DAYOFF_DESCRIPTION,
    value: PreferenceDefaultValues.PREFERENCE_HALF_DAYOFF_VALUE,
  },
  {
    code: PreferenceCodes.PREFERENCE_WORK_FROM_HOME_CODE,
    description: PreferenceDescriptions.PREFERENCE_WORK_FROM_HOME_DESCRIPTION,
    value: PreferenceDefaultValues.PREFERENCE_WORK_FROM_VALUE,
  },
  {
    code: PreferenceCodes.PREFERENCE_PARKING_FEE_CODE,
    description: PreferenceDescriptions.PREFERENCE_PARKINFG_FEE_DESCRIPTION,
    value: PreferenceDefaultValues.PREFERENCE_PARKING_FEE_VALUE,
  },
];

export default preferenceInitialRecords;
