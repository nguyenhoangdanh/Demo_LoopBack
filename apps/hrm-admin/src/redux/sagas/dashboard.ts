import { takeEvery, call, put } from "redux-saga/effects";
import {
  getOffEmployees,
  getTotalEmployees,
  getWfhEmployees,
  getWorkingEmployees,
} from "../../api/";
import {
  DASHBOARD_CHECK_IN_OUT,
  DASHBOARD_FETCH,
  DASHBOARD_OFF_WFH,
} from "../actions";
import {
  fetchDashboardFailure,
  fetchDashboardStart,
  fetchDashboardSuccess,
  fetchOffEmployees,
  fetchTotalEmployees,
  fetchWfhEmployees,
  fetchWorkingEmployees,
} from "../reducers/dashboard";

function* fetchOffWfhSaga(): Generator<any, any, any> {
  try {
    yield put(fetchDashboardStart());

    const offEmployees = yield call(getOffEmployees);
    yield put(fetchOffEmployees({ offEmployees: offEmployees.length }));

    const wfhEmployees = yield call(getWfhEmployees);
    yield put(fetchWfhEmployees({ wfhEmployees: wfhEmployees.length }));

    yield put(fetchDashboardSuccess());
  } catch (e) {
    console.log("[fetchCheckInSaga] error: ", e);
    yield put(fetchDashboardFailure({ error: `Error: ${e}` }));
  }
}

function* fetchCheckInSaga(): Generator<any, any, any> {
  try {
    yield put(fetchDashboardStart());

    const workingEmployees = yield call(getWorkingEmployees);
    yield put(
      fetchWorkingEmployees({ workingEmployees: workingEmployees.length })
    );

    yield put(fetchDashboardSuccess());
  } catch (e) {
    console.log("[fetchCheckInSaga] error: ", e);
    yield put(fetchDashboardFailure({ error: `Error: ${e}` }));
  }
}

function* fetchDashboardSaga(): Generator<any, any, any> {
  try {
    yield put(fetchDashboardStart());

    const totalEmployees = yield call(getTotalEmployees);
    yield put(
      fetchTotalEmployees({ totalEmployees: totalEmployees.data.count })
    );

    const workingEmployees = yield call(getWorkingEmployees);
    yield put(
      fetchWorkingEmployees({ workingEmployees: workingEmployees.length })
    );

    const offEmployees = yield call(getOffEmployees);
    yield put(fetchOffEmployees({ offEmployees: offEmployees.length }));

    const wfhEmployees = yield call(getWfhEmployees);
    yield put(fetchWfhEmployees({ wfhEmployees: wfhEmployees.length }));

    yield put(fetchDashboardSuccess());
  } catch (e) {
    console.log("[fetchDashboardSaga] error: ", e);
    yield put(fetchDashboardFailure({ error: `Error: ${e}` }));
  }
}

export default function* sagas() {
  yield takeEvery(DASHBOARD_FETCH, fetchDashboardSaga);
  yield takeEvery(DASHBOARD_CHECK_IN_OUT, fetchCheckInSaga);
  yield takeEvery(DASHBOARD_OFF_WFH, fetchOffWfhSaga);
}
