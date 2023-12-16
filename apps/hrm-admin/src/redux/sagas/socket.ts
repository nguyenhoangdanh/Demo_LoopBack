import { eventChannel as EventChannel } from "redux-saga";
import { call, fork, put, take, takeEvery } from "redux-saga/effects";
import io, { Socket } from "socket.io-client";
import {
  SOCKET_CONNECT_SUCCESS,
  SOCKET_ESTABLISH,
  doAction,
  SOCKET_AUTHENTICATE_SUCCESS,
  DASHBOARD_CHECK_IN_OUT,
  DASHBOARD_OFF_WFH,
} from "@/redux/actions";
import { BASE_URL, MessageAction, SagaConst } from "@/common";
import {
  socketAuthenticateSuccess,
  socketConnectSuccess,
} from "../reducers/socket";
import { setCheckInStatus, setCheckOutStatus } from "../reducers/employees";
import dayjs from "dayjs";

//-------------------------------------------------------------------------
let socket: Socket | null;

//-------------------------------------------------------------------------
function* onIOConnected() {
  yield takeEvery(SOCKET_CONNECT_SUCCESS, function* run() {
    if (!socket) {
      console.log("Failed connect!.... ");
      return;
    }

    socket.emit("authenticate");
  });
}

//-------------------------------------------------------------------------
function* onIOAuthenticated() {
  yield takeEvery(SOCKET_AUTHENTICATE_SUCCESS, function* run() {
    if (!socket) {
      console.log("Failed authenticate!.... ");
      return;
    }

    socket.emit("join", {
      rooms: ["message"],
    });
  });
}

//-------------------------------------------------------------------------
const connect = (socketProps: any) => {
  const { host, options = {} } = socketProps;
  if (!socketProps?.host) {
    throw new Error("Invalid Socket IO Props!");
  }
  socket = io(host, { ...options });
};

//-------------------------------------------------------------------------
const on = (opts: { socket: Socket; event: string; action: string }) => {
  const { socket, event } = opts;

  return EventChannel((dispatch: any) => {
    if (event === SagaConst.CONNECT) {
      socket.on(event, () => {
        dispatch(doAction(SOCKET_CONNECT_SUCCESS));
        dispatch(socketConnectSuccess({ isConnected: true }));
      });
    } else if (event === SagaConst.AUTHENTICATED) {
      socket.on(event, () => {
        dispatch(doAction(SOCKET_AUTHENTICATE_SUCCESS));
        dispatch(socketAuthenticateSuccess({ isAuthenticated: true }));
      });
    } else if (event === SagaConst.DASHBOARD) {
      socket.on(event, (message: any) => {
        switch (message?.action) {
          case MessageAction.CHECK_IN:
            dispatch(doAction(DASHBOARD_CHECK_IN_OUT));
            dispatch(
              setCheckInStatus({
                userId: message?.payload.userId,
                createdAt: message?.payload.createdAt,
              })
            );
            break;
          case MessageAction.CHECK_OUT:
            dispatch(doAction(DASHBOARD_CHECK_IN_OUT));
            dispatch(
              setCheckOutStatus({
                userId: message?.payload.userId,
              })
            );
            break;
          case MessageAction.ISSUE:
            const requestDate = message?.payload.requestDate;
            if (
              dayjs(requestDate).format("YYYY-MM-DD") ===
              dayjs().format("YYYY-MM-DD")
            ) {
              dispatch(doAction(DASHBOARD_OFF_WFH));
            }
            break;
          default:
            break;
        }
      });
    } else {
      socket.on(event, (message: any) => {
        console.log("message: ", message);
      });
    }

    return () => {
      socket.off(event);
    };
  });
};

//-------------------------------------------------------------------------
function* listen(props: any): Generator<any, any, any> {
  const channel = yield call(on, props);
  try {
    while (true) {
      const action = yield take(channel);
      yield put(action);
    }
  } catch (e) {
    console.log("[listen] | listen error", e);
  } finally {
    console.log(props, " is terminated!");
  }
}

//-------------------------------------------------------------------------
function* establish() {
  yield takeEvery(SOCKET_ESTABLISH, function* run() {
    const value = localStorage.getItem("token") ?? "";
    yield call(connect, {
      host: BASE_URL,
      options: {
        path: SagaConst.STREAM,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        extraHeaders: {
          Authorization: `Bearer ${value}`,
        },
      },
    });
    if (!socket) {
      console.error("Failed to initialize socket!");
      return;
    }
    //Events
    const events = [
      { event: SagaConst.CONNECT },
      { event: SagaConst.AUTHENTICATED },
      { event: SagaConst.DASHBOARD },
    ];
    for (const el of events) {
      yield fork(listen, { socket, ...el });
    }
  });
}

//-------------------------------------------------------------------------
export default function* sagas() {
  yield fork(establish);
  yield fork(onIOConnected);
  yield fork(onIOAuthenticated);
}
