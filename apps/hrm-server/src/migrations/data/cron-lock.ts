import { CronCode } from '@mt-hrm/common';

const cronLocks: Array<{
  description: string;
  code: string;
  cronTime: string;
}> = [
  {
    description: 'Encode user images',
    code: CronCode.ENCODE,
    cronTime: '30 16 * * *',
  },
  {
    description: 'Check out user attendances',
    code: CronCode.CHECK_OUT,
    cronTime: '30 16 * * *',
  },
  {
    description: 'Delete redundant user images',
    code: CronCode.DELETE_IMAGES,
    cronTime: '30 16 * * *',
  },
  {
    description: 'Sync attendance data with Notion',
    code: CronCode.NOTION_SYNC,
    cronTime: '30 05 * * *',
  },
];

export default cronLocks;
