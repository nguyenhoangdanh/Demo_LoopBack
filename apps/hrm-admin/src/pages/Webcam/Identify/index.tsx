import { Button } from "@mui/material";
import React, { useCallback, useState } from "react";
import { useCreate, useNotify } from "react-admin";
import { IIdentify, IIdentifyCb } from "../../../common";

export const Identify = (props: IIdentifyCb) => {
  const { callback } = props;
  const [create] = useCreate();
  const notify = useNotify();

  return (
    <Button color="secondary" itemType="file" onClick={callback}>
      Check In
    </Button>
  );
};
