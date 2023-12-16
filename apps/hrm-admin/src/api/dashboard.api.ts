import { BASE_URL, IssueStatus, IssueType, PATH } from "@/common";
import { LbProviderGetter } from "@/helpers";
import dayjs from "dayjs";

type TypeIdResponse = { data: { id: number }[] };
type AuthorIdResponse = {
  data: { data: { authorId: number; status: { code: string } }[] };
};

export const getTotalEmployees = (): Promise<any> => {
  return LbProviderGetter({
    baseUrl: BASE_URL,
  }).send(`${PATH.USERS}/count`, {
    method: "get",
  });
};

export const getWorkingEmployees = async (): Promise<any> => {
  const todayAttendances = (await LbProviderGetter({
    baseUrl: BASE_URL,
  }).send(`${PATH.ATTENDANCE}`, {
    method: "get",
    query: {
      filter: {
        fields: ["userId"],
        where: {
          createdAt: {
            between: [
              dayjs(new Date()).startOf("day").toString(),
              dayjs(new Date()).endOf("day").toString(),
            ],
          },
          checkOutTime: null,
        },
      },
    },
  })) as { data: { data: { userId: number }[] } };

  return Array.from(
    new Set(todayAttendances.data.data.map((attendance) => attendance.userId))
  );
};

export const getCheckedOutEmployees = async (): Promise<any> => {
  const todayAttendances = (await LbProviderGetter({
    baseUrl: BASE_URL,
  }).send(`${PATH.ATTENDANCE}`, {
    method: "get",
    query: {
      filter: {
        fields: ["userId"],
        where: {
          createdAt: {
            between: [
              dayjs(new Date()).startOf("day").toString(),
              dayjs(new Date()).endOf("day").toString(),
            ],
          },
          checkOutTime: { neq: null },
        },
      },
    },
  })) as { data: { data: { userId: number }[] } };

  return Array.from(
    new Set(todayAttendances.data.data.map((attendance) => attendance.userId))
  );
};

export const getStatusEmployees = (employeeIds: number[]): Promise<any> => {
  return LbProviderGetter({
    baseUrl: BASE_URL,
  }).send(`${PATH.ATTENDANCE}`, {
    method: "get",
    query: {
      filter: {
        fields: ["userId", "createdAt", "checkOutTime"],
        where: {
          createdAt: {
            between: [
              dayjs(new Date()).startOf("day").toString(),
              dayjs(new Date()).endOf("day").toString(),
            ],
          },
          userId: {
            inq: employeeIds,
          },
        },
      },
    },
  });
};
export const getOffEmployees = async (): Promise<any> => {
  // Get full day off employees
  const fullDayOffTypeId: TypeIdResponse = await getTypeIdFromCode(
    IssueType.FULL_DAY_OFF
  );
  const fullDayOffAuthorIds: AuthorIdResponse =
    await getAuthorIdOfIssueByTypeId(fullDayOffTypeId.data[0].id);
  const arrayOfFullDayOff = fullDayOffAuthorIds.data.data.filter(
    (issue) => issue?.status?.code === IssueStatus.COMPLETED
  );

  // Get half day off employees
  const halfDayOffTypeId: TypeIdResponse = await getTypeIdFromCode(
    IssueType.HALF_DAY_OFF
  );
  const halfDayOffAuthorIds: AuthorIdResponse =
    await getAuthorIdOfIssueByTypeId(halfDayOffTypeId.data[0].id);
  const arrayOfHalfDayOff = halfDayOffAuthorIds.data.data.filter(
    (issue) => issue?.status?.code === IssueStatus.COMPLETED
  );

  // Merge them together
  const arrayOfOffEmployees = [...arrayOfFullDayOff, ...arrayOfHalfDayOff];

  return Array.from(
    new Set(arrayOfOffEmployees.map((issue) => issue.authorId))
  );
};

export const getWfhEmployees = async (): Promise<any> => {
  const wfhTypeIds: TypeIdResponse = await getTypeIdFromCode(
    IssueType.WORK_FROM_HOME
  );
  const wfhAuthorIds: AuthorIdResponse = await getAuthorIdOfIssueByTypeId(
    wfhTypeIds.data[0].id
  );

  const arrayOfWfhEmployees = wfhAuthorIds.data.data.filter(
    (issue) => issue?.status?.code === IssueStatus.COMPLETED
  );
  return Array.from(
    new Set(arrayOfWfhEmployees.map((issue) => issue.authorId))
  );
};

export const getAuthorIdOfIssueByTypeId = (typeId: number): Promise<any> => {
  return LbProviderGetter({
    baseUrl: BASE_URL,
  }).send(`${PATH.ISSUES}`, {
    method: "get",
    query: {
      filter: {
        where: {
          requestDate: {
            between: [
              dayjs(new Date()).startOf("day").toString(),
              dayjs(new Date()).endOf("day").toString(),
            ],
          },
          typeId,
        },
        include: ["status"],
      },
    },
  });
};

export const getTypeIdFromCode = (code: string): Promise<any> => {
  return LbProviderGetter({
    baseUrl: BASE_URL,
  }).send(`${PATH.TYPES}`, {
    method: "get",
    query: {
      filter: {
        fields: ["id"],
        where: {
          code: {
            eq: code,
          },
        },
      },
    },
  });
};
