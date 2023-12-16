import { dayjs } from '@lb/infra';
import CustomParseFormat from 'dayjs/plugin/customParseFormat';
import isoWeek from 'dayjs/plugin/isoWeek';
import timezone from 'dayjs/plugin/timezone';
import weekday from 'dayjs/plugin/weekday';
import utc from 'dayjs/plugin/utc';
import { TIMEZONE } from '@mt-hrm/common';

dayjs.extend(CustomParseFormat);
dayjs.extend(timezone);
dayjs.extend(weekday);
dayjs.extend(isoWeek);
dayjs.extend(utc);

function getVnDate(isoString: string): dayjs.Dayjs {
  return dayjs(isoString).tz(TIMEZONE.VN);
}

export { dayjs, getVnDate };
