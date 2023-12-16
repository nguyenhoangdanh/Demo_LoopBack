import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import {  PATH } from "@/common";
import { useDataProvider } from "ra-core";
export default function DayOffEmployee() {
  const [dataDayOff, setDayOff] = useState<any>();

  const dataProvider = useDataProvider();
  const currentUserId = localStorage.getItem("userId");
  const currentYear = new Date().getFullYear();

  const getDayOff = async () => {
    const data: any = await dataProvider.send(
      `${PATH.USERS}/days-off/`,
      {
        method: "get",
        query: {
          filter: {
            userIds: [currentUserId],
            years: [currentYear],
          }
        }
      },
    );
    setDayOff(data);
  };

  useEffect(() => {
    getDayOff();
  }, []);

  return (
    <>
      <Typography>
        Your days-off this year is {dataDayOff?.data.spentDayOff} /
        {dataDayOff?.data.totalDayOff}
      </Typography>
    </>
  );
}
