import { IDisplayedUsers, IStatusDisplayedUser } from "@/common";
import { createSlice } from "@reduxjs/toolkit";

const initialState: IDisplayedUsers = {};

interface ISetCheckInStatus {
  userId: number;
  createdAt?: string;
}

interface ISetCheckOutStatus {
  userId: number;
}

export const employeesSlice = createSlice({
  name: "employees",
  initialState,

  reducers: {
    fetchEmployeesStatus: (
      state,
      { payload }: { payload: IDisplayedUsers }
    ) => {
      Object.assign(state, payload);
    },
    setCheckInStatus: (state, { payload }: { payload: ISetCheckInStatus }) => {
      state[payload.userId].status = IStatusDisplayedUser.CHECKED_IN;
      state[payload.userId].createdAt = payload.createdAt;
    },
    setCheckOutStatus: (
      state,
      { payload }: { payload: ISetCheckOutStatus }
    ) => {
      state[payload.userId].status = IStatusDisplayedUser.CHECKED_OUT;
    },
  },
});

export const { fetchEmployeesStatus, setCheckInStatus, setCheckOutStatus } =
  employeesSlice.actions;

export const employeesReducer = employeesSlice.reducer;
