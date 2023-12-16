import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SocketInitialState {
  isConnected: boolean;
  isAuthenticated: boolean;
}

type SocketConnectSuccessPayload = PayloadAction<
  Pick<SocketInitialState, "isConnected">
>;
type SocketAuthenticateSuccessPayload = PayloadAction<
  Pick<SocketInitialState, "isAuthenticated">
>;

const initialState: SocketInitialState = {
  isConnected: false,
  isAuthenticated: false,
};

export const socketSlice = createSlice({
  name: "socket",
  initialState,

  reducers: {
    socketConnectSuccess: (state, { payload }: SocketConnectSuccessPayload) => {
      Object.assign(state, payload);
    },
    socketAuthenticateSuccess: (
      state,
      { payload }: SocketAuthenticateSuccessPayload
    ) => {
      Object.assign(state, payload);
    },
  },
});

export const { socketConnectSuccess, socketAuthenticateSuccess } =
  socketSlice.actions;

export const socketReducer = socketSlice.reducer;
