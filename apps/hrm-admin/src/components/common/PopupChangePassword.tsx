import React, { useCallback, useEffect, useState } from "react";
import { useNotify } from "react-admin";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { IPopupPassword } from "../../common/types";
import { useNavigate } from "react-router-dom";
import { BASE_URL, PATH } from "@/common/constants";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export const PopupChangePassword = (props: IPopupPassword) => {
  const { open, onClose } = props;
  const notify = useNotify();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorCurrentPassword, setErrorCurrentPassword] = useState("");
  const [errorNewPassword, setErrorNewPassword] = useState("");
  const [errorConfirmPassword, setErrorConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorNewPasswordLength, setErrorNewPasswordLength] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(true);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(true);
  const [formValue, setFormValue] = useState<{
    currentPassword?: string;
    newPassword?: string;
  }>({
    currentPassword: "",
    newPassword: "",
  });

  const [isCurrentPasswordTouched, setIsCurrentPasswordTouched] =
    useState(false);
  const [isNewPasswordTouched, setIsNewPasswordTouched] = useState(false);
  const [isConfirmPasswordTouched, setIsConfirmPasswordTouched] =
    useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const validateForm = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return false;
    }
    if (currentPassword === newPassword) {
      return false;
    }
    if (newPassword.length < 8) {
      return false;
    }
    if (/\s/.test(newPassword)) {
      return false;
    }
    if (newPassword !== confirmPassword) {
      return false;
    }
    return true;
  };

  const handleChange = (field: string, value: string) => {
    switch (field) {
      case "currentPassword":
        setCurrentPassword(value);
        setErrorCurrentPassword("");
        break;
      case "newPassword":
        setNewPassword(value);
        setErrorNewPassword("");
        break;
      case "confirmPassword":
        setConfirmPassword(value);
        setErrorConfirmPassword("");
        break;
      default:
        break;
    }
    setIsFormValid(validateForm());
  };

  const handleBlur = (field: string) => {
    switch (field) {
      case "currentPassword":
        setIsCurrentPasswordTouched(true);
        if (!currentPassword) {
          setErrorCurrentPassword("Please enter the current password");
        } else if (currentPassword.length < 8) {
          setErrorCurrentPassword(
            "Password must be at least 8 characters long"
          );
        } else if (/\s/.test(currentPassword)) {
          setErrorCurrentPassword("Password must not contain spaces");
        } else {
          setErrorCurrentPassword("");
        }
        break;
      case "newPassword":
        setIsNewPasswordTouched(true);
        if (!newPassword) {
          setErrorNewPassword("Please enter the new password");
        } else if (currentPassword === newPassword) {
          setErrorNewPassword(
            "New password mustn't be the same as the current password"
          );
        } else if (newPassword.length < 8) {
          setErrorNewPasswordLength(
            "Password must be at least 8 characters long"
          );
        } else if (/\s/.test(newPassword)) {
          setErrorNewPassword("Password must not contain spaces");
        }
        break;
      case "confirmPassword":
        setIsConfirmPasswordTouched(true);
        if (!confirmPassword) {
          setErrorConfirmPassword("Please enter the confirmation password");
        }
        if (newPassword !== confirmPassword) {
          setErrorConfirmPassword("Passwords do not match");
        }
        break;
      default:
        break;
    }
  };

  const handleSave = useCallback(() => {
    const diffPass = {
      currentPassword,
      newPassword,
    };

    if (validateForm()) {
      fetch(`${BASE_URL}/${PATH.AUTH}/${PATH.CHANGE_PASSWORD}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(diffPass),
      })
        .then((response) => {
          if (response.ok) {
            localStorage.removeItem("token");
            notify("Successful password update!", { type: "success" });
            navigate(`/${PATH.LOGIN}`);
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
  }, [currentPassword, newPassword, confirmPassword]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        handleSave();
      }
    },
    [currentPassword, newPassword, confirmPassword]
  );

  useEffect(() => {
    if (!data) {
      return;
    }
    setFormValue((prev: any) => {
      return {
        ...prev,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      };
    });

    return () => {};
  }, [data]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent>
        <TextField
          label="Current Password"
          type={showCurrentPassword ? "password" : "text"}
          value={currentPassword}
          onChange={(e) => handleChange("currentPassword", e.target.value)}
          onBlur={() => handleBlur("currentPassword")}
          fullWidth
          margin="normal"
          error={!!errorCurrentPassword && isCurrentPasswordTouched}
          helperText={errorCurrentPassword}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  edge="end"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="New Password"
          type={showNewPassword ? "password" : "text"}
          value={newPassword}
          onChange={(e) => handleChange("newPassword", e.target.value)}
          onBlur={() => handleBlur("newPassword")}
          fullWidth
          margin="normal"
          error={
            (!!errorNewPassword || !!errorNewPasswordLength) &&
            isNewPasswordTouched
          }
          helperText={errorNewPassword || errorNewPasswordLength}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  edge="end"
                  tabIndex={-1}
                >
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Confirm Password"
          type={showConfirmPassword ? "password" : "text"}
          value={confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          onBlur={() => handleBlur("confirmPassword")}
          fullWidth
          margin="normal"
          error={!!errorConfirmPassword && isConfirmPasswordTouched}
          helperText={errorConfirmPassword}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  edge="end"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          onKeyDown={handleKeyDown}
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
