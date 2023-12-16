import { PaletteMode } from "@mui/material";
import { Components, createTheme } from "@mui/material/styles";

const DEFAULT_SPACING = 4;

// ----------------------------------------------------------
const getPalette = (opts: { paletteMode: PaletteMode }) => {
  const { paletteMode } = opts;

  return {
    mode: paletteMode,
    common: {
      black: "#111",
      white: "#fff",
    },
    primary: {
      main: "#AF5F5F",
      contrastText: "#fff",
    },
    secondary: {
      main: "#87AFAF",
      contrastText: "#fff",
    },
    info: {
      main: "#EBC17A",
      contrastText: "#fff",
    },
    error: {
      main: "#924653",
      contrastText: "#fff",
    },
    warning: {
      main: "#594743",
      contrastText: "#fff",
    },
    success: {
      main: "#6789CA",
      contrastText: "#fff",
    },
    grey: {
      50: "#AAAAAA",
      100: "#96969659",
    },
  };
};

// ----------------------------------------------------------
const getSpacing = (factor: number): number => {
  return DEFAULT_SPACING * factor;
};

// ----------------------------------------------------------
const getOverrideComponents = (): Components<
  Omit<ReturnType<typeof createTheme>, "components">
> => {
  return {
    MuiButton: {
      defaultProps: {
        variant: "contained",
        size: "small",
        fullWidth: true,
        disableElevation: true,
        sx: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiButtonGroup: {
      defaultProps: {
        variant: "contained",
        size: "small",
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },
    MuiSelect: {
      defaultProps: {
        size: "small",
      },
    },
  };
};

// ----------------------------------------------------------
const getTheme = (opts: { paletteMode: PaletteMode }) => {
  const { paletteMode } = opts;

  return createTheme({
    palette: getPalette({ paletteMode }),
    typography: { fontFamily: "Roboto" },
    spacing: getSpacing,
    components: getOverrideComponents(),
  });
};

// ----------------------------------------------------------
export const Theme = {
  LIGHT: getTheme({ paletteMode: "light" }),
  DARK: getTheme({ paletteMode: "dark" }),
};
