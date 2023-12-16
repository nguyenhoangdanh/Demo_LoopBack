import { getStatusEmployees } from "@/api";
import { IDisplayedUsers, IStatusDisplayedUser } from "@/common";
import dayjs from "dayjs";
import { call, put, takeLatest } from "redux-saga/effects";
import { employeesFetchStatus, EMPLOYEES_FETCH } from "../actions";
import { fetchEmployeesStatus } from "../reducers/employees";

interface IData {
  createdAt: string;
  checkOutTime: string | null;
  userId: number;
}

function* fetchEmployeesSaga({
  payload,
}: ReturnType<typeof employeesFetchStatus>): Generator<any, any, any> {
  try {
    // Parse usersData to array of Id
    const userIds = payload.usersData;
    const { data } = yield call(getStatusEmployees, userIds);

    const attendancesData: IData[] = data.data;

    let parsedData: IDisplayedUsers = {};

    // Add users that have attendance records today
    attendancesData.forEach((attendance) => {
      if (
        !parsedData[attendance.userId] ||
        dayjs(attendance.createdAt).isAfter(
          parsedData[attendance.userId].createdAt
        )
      ) {
        parsedData[attendance.userId] = {
          status:
            attendance.checkOutTime === null
              ? IStatusDisplayedUser.CHECKED_IN
              : IStatusDisplayedUser.CHECKED_OUT,
          createdAt: attendance.createdAt,
        };
      }
    });

    // Add users that have no data today
    userIds.forEach((userId) => {
      if (!parsedData[userId]) {
        parsedData[userId] = {
          status: IStatusDisplayedUser.NO_DATA,
        };
      }
    });

    yield put(fetchEmployeesStatus(parsedData));
  } catch (e) {
    console.log("[fetchEmployeesSaga] error: ", e);
  }
}

export default function* sagas() {
  yield takeLatest(EMPLOYEES_FETCH, fetchEmployeesSaga);
}
