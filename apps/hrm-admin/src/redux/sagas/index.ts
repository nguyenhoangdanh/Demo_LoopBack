import { spawn } from "redux-saga/effects";
import dashboardSaga from "./dashboard";
import socketSaga from "./socket";
import employeesSaga from "./employees";

export default function* rootSaga() {
  yield spawn(socketSaga);
  yield spawn(dashboardSaga);
  yield spawn(employeesSaga);
}
