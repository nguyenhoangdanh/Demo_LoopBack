import { styled } from "@mui/material/styles";
import { autocompleteClasses } from "@mui/material/Autocomplete";
import { AutocompleteGetTagProps } from "@mui/material";
import { HTMLAttributes } from "react";

export const Root = styled("div")(
  ({ theme }) => `
  color: ${
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,.85)"
  };
  font-size: 12px;
`
);

export const Label = styled("label")`
  padding: 0 0 4px;
  line-height: 1.5;
  display: block;
`;

export const InputWrapper = styled("div")(
  ({ theme }) => `
//   width: 150px;
//   border: 1px solid ${theme.palette.mode === "dark" ? "#434343" : "#d9d9d9"};
  background-color: ${theme.palette.mode === "dark" ? "#141414" : "#fff"};
  border-radius: 4px;
  padding: 1px;
  display: flex;
  flex-wrap: wrap;

  &:hover {
    border-color: ${theme.palette.mode === "dark" ? "#177ddc" : "#40a9ff"};
  }

  &.focused {
    border-color: ${theme.palette.mode === "dark" ? "#177ddc" : "#40a9ff"};
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }

  & input {
    background-color: ${theme.palette.mode === "dark" ? "#141414" : "#fff"};
    color: ${
      theme.palette.mode === "dark"
        ? "rgba(255,255,255,0.65)"
        : "rgba(0,0,0,.85)"
    };
    height: 20px;
    box-sizing: border-box;
    padding: 2px 3px;
    width: 0;
    min-width: 30px;
    flex-grow: 1;
    border: 0;
    margin: 0;
    outline: 0;
  }
`
);

interface TagProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
}

function Tag(props: TagProps) {
  const { label, ...other } = props;
  return label ? (
    <div {...other}>
      <span>{label}</span>
    </div>
  ) : (
    <></>
  );
}

export const StyledTag = styled(Tag)<TagProps>(
  ({ theme }) => `
    display: inline-flex;
    align-items: center;
    height: 18px;
    min-width: 20px;
    margin: 1px;
    line-height: 14px;
    background-color: ${
      theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "#fafafa"
    };
    border: 1px solid ${theme.palette.mode === "dark" ? "#303030" : "#e8e8e8"};
    border-radius: 2px;
    box-sizing: content-box;
    padding: 2px 4px;
    outline: 0;
    overflow: hidden;
  
    & span {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  
    & svg {
      font-size: 12px;
      cursor: pointer;
      padding: 4px;
    }
`
);

export const Listbox = styled("ul")(
  ({ theme }) => `
  width: 160px;
  margin: 1px 0 0;
  padding: 0;
  list-style: none;
  background-color: ${theme.palette.mode === "dark" ? "#141414" : "#fff"};
  overflow: auto;
  max-height: 200px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;

  & li {
    padding: 5px 12px;
    display: flex;

    & span {
      flex-grow: 1;
    }
  }
`
);
