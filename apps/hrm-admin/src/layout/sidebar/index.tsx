import React from "react";
import { Sidebar } from "react-admin";

export const CustomSidebar = (props: any) => (
  <Sidebar
    sx={{
      "& .MuiPaper-root": {
        //style css sidebar here
      },
    }}
    {...props}
  />
);
