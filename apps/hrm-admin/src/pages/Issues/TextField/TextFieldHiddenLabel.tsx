import * as React from "react";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

export default function TextFieldHiddenLabel() {
  return (
    <TextField
      hiddenLabel
      id="hidden-label-small"
      sx={{
        fontSize: "5px",
        width: "140px",
        outline: "none",
      }}
      defaultValue="Small"
      variant="standard"
      size="small"
    />
  );
}
