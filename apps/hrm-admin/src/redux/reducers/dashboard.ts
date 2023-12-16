import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DashboardState {
  totalEmployees: number;
  workingEmployees: number;
  wfhEmployees: number;
  offEmployees: number;
  loading: boolean;
  error: string | null;
}

type fetchTotalEmployeesPayload = PayloadAction<
  Pick<DashboardState, "totalEmployees">
>;
type fetchWorkingEmployeesPayload = PayloadAction<
  Pick<DashboardState, "workingEmployees">
>;
type fetchWfhEmployeesPayload = PayloadAction<
  Pick<DashboardState, "wfhEmployees">
>;
type fetchOffEmployeesPayload = PayloadAction<
  Pick<DashboardState, "offEmployees">
>;
type fetchDashboardFailure = PayloadAction<Pick<DashboardState, "error">>;

const initialState: DashboardState = {
  totalEmployees: 0,
  workingEmployees: 0,
  wfhEmployees: 0,
  offEmployees: 0,
  loading: false,
  error: null,
};

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,

  reducers: {
    fetchTotalEmployees: (state, { payload }: fetchTotalEmployeesPayload) => {
      state.totalEmployees = payload.totalEmployees;
    },
    fetchWorkingEmployees: (
      state,
      { payload }: fetchWorkingEmployeesPayload
    ) => {
      state.workingEmployees = payload.workingEmployees;
    },
    fetchWfhEmployees: (state, { payload }: fetchWfhEmployeesPayload) => {
      state.wfhEmployees = payload.wfhEmployees;
    },
    fetchOffEmployees: (state, { payload }: fetchOffEmployeesPayload) => {
      state.offEmployees = payload.offEmployees;
    },
    fetchDashboardStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDashboardSuccess: (state) => {
      state.loading = false;
    },
    fetchDashboardFailure: (state, { payload }: fetchDashboardFailure) => {
      state.error = payload.error;
      state.loading = false;
    },
  },
});

export const {
  fetchTotalEmployees,
  fetchWorkingEmployees,
  fetchWfhEmployees,
  fetchOffEmployees,
  fetchDashboardStart,
  fetchDashboardSuccess,
  fetchDashboardFailure,
} = dashboardSlice.actions;

export const dashboardReducer = dashboardSlice.reducer;
