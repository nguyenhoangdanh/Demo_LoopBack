import React, { useCallback, useState } from "react";
import { useLogin, useNotify } from "react-admin";
import { makeStyles } from "@mui/styles";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  TextField,
  Theme,
  useTheme,
} from "@mui/material";
import MinimalTechLogo from "../../assets/image/minimaltech.svg";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const useStyles = makeStyles((theme: Theme) => {
  const textFieldColor =
    theme.palette.mode === "dark"
      ? theme.palette.common.white
      : theme.palette.common.black;

  return {
    root: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: theme.palette.common.black,
    },
    card: {
      maxWidth: theme.spacing(100),
      padding: theme.spacing(4),
      borderRadius: `${theme.spacing(4)} !important`,
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: theme.spacing(4),
    },
    customTextField: {
      "& label.Mui-focused": {
        color: textFieldColor,
      },
      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        color: `${textFieldColor} !important`,
        borderColor: textFieldColor,
      },
    },
  };
});

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const classes = useStyles();
  const login = useLogin();
  const notify = useNotify();
  const theme = useTheme();

  const handleLogin = async () => {
    try {
      await login({ username, password });
    } catch (error) {
      notify("Invalid credentials");
    }
  };

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        handleLogin();
      }
    },
    [username, password]
  );

  const handleTogglePasswordVisibility = useCallback(() => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  }, []);

  return (
    <Box className={classes.root}>
      <Box width="100%" display="flex" justifyContent="center">
        <img
          src={MinimalTechLogo}
          style={{ width: "32rem", height: "4rem", marginBottom: "4rem" }}
          alt="logo"
        />
      </Box>
      <Card className={classes.card}>
        <CardContent>
          <form className={classes.form}>
            <TextField
              type="text"
              label="Username"
              value={username}
              variant="outlined"
              onChange={(e) => setUsername(e.target.value)}
              className={classes.customTextField}
            />
            <TextField
              type={showPassword ? "password" : "text"}
              label="Password"
              value={password}
              variant="outlined"
              onChange={(e) => setPassword(e.target.value)}
              className={classes.customTextField}
              onKeyDown={handleKeyDown}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      tabIndex={-1}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </form>
          <Button
            color="primary"
            variant="contained"
            sx={{ marginTop: theme.spacing(4) }}
            onClick={handleLogin}
          >
            Sign In
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};
