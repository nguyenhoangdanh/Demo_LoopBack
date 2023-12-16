import moment from "moment";
import { ConfigurationDataTypes, DATE_TIME } from "../common";

// format YYYY-MM-DD HH:MM:SS
// export const formatTimeToYMD_HMS = (time: string) => {
//   const format = moment(time).format('YYYY-MM-DD hh:mm:ss');
//   return format;
// };
// format YYYY-MM-DD (list Article)
export const formatTimeToYMD = (time: string) => {
  const format =
    time === null
      ? ConfigurationDataTypes.NA
      : moment(time).format(`${DATE_TIME.DATE_1}, ${DATE_TIME.TIME_1}`);
  return format;
};
