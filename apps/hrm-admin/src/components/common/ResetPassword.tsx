import { BASE_URL, IPopupResetPassword, PATH } from "@/common";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useNotify } from "ra-core";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DialogProps } from "@mui/material/Dialog";
import { SelectChangeEvent } from "@mui/material/Select";

export const ResetPassword = (props: IPopupResetPassword) => {
  const { open, onClose, userId } = props;
  const notify = useNotify();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [errorNewPassword, setErrorNewPassword] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

  const [fullWidth, setFullWidth] = useState(true);
  const [maxWidth, setMaxWidth] = useState<DialogProps["maxWidth"]>("sm");

  const handleMaxWidthChange = (event: SelectChangeEvent<typeof maxWidth>) => {
    setMaxWidth(
      // @ts-expect-error autofill of arbitrary value is not handled.
      event.target.value
    );
  };

  const handleFullWidthChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFullWidth(event.target.checked);
  };

  const validateForm = () => {
    return true;
  };

  const handleChange = (field: string, value: string) => {
    switch (field) {
      case "newPassword":
        setNewPassword(value);
        setErrorNewPassword("");
        break;
      default:
        break;
    }
    setIsFormValid(validateForm());
  };

  const handleSave = useCallback(() => {
    const diffPass = {
      userId,
      newPassword,
    };

    if (validateForm()) {
      fetch(`${BASE_URL}/${PATH.AUTH}/${PATH.RESET_PASSWORD}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(diffPass),
      })
        .then((response) => {
          if (response.ok) {
            navigate(`${PATH.LOGIN}`);
            notify("Successful password update!", { type: "success" });
          }
          return response.json();
        })
        .then((data) => {
          if (data.error) {
            notify(data.error.message, { type: "error" });
          }
        });
    } else {
      notify("Please enter the password data fields", { type: "error" });
    }
  }, [newPassword, userId]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
    >
      <DialogTitle>Reset Password</DialogTitle>
      <DialogContent>
        <TextField
          label="New Password"
          type="password"
          value={newPassword ?? ""}
          onChange={(e) => handleChange("newPassword", e.target.value)}
          fullWidth
          margin="normal"
          // error={!!errorCurrentPassword && isCurrentPasswordTouched}
          // helperText={errorCurrentPassword}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSave} color="primary" variant="contained">
          Save
        </Button>
        <Button color="inherit" onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
