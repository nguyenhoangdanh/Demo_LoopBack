export const doAction = (type?: string, data?: any) => ({ type, data });

//-------------------------------------------------------------------------
export const SOCKET_ESTABLISH = "SOCKET/ESTABLISH";
export const SOCKET_CONNECT_SUCCESS = "SOCKET/CONNECT_SUCCESS";
export const SOCKET_AUTHENTICATE_SUCCESS = "SOCKET/AUTHENTICATE_SUCCESS";
export const SOCKET_LISTEN_MESSAGE = "SOCKET/LISTEN_MESSAGE";

//-------------------------------------------------------------------------
export const DASHBOARD_FETCH = "DASHBOARD/FETCH";
export const DASHBOARD_CHECK_IN_OUT = "DASHBOARD/CHECK_IN_OUT";
export const DASHBOARD_OFF_WFH = "DASHBOARD/OFF_WFH";

//-------------------------------------------------------------------------
export const EMPLOYEES_FETCH = "EMPLOYEES/FETCH";

export const employeesFetchStatus = (usersData: number[]) => ({
  type: EMPLOYEES_FETCH,
  payload: { usersData },
});



