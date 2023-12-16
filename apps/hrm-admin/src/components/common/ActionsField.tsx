import { getError } from "@/utilities";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { useCreatePath, useRedirect } from "ra-core";
import { DeleteButton } from "react-admin";
import ContentCreate from "@mui/icons-material/Create";
import ImageEye from "@mui/icons-material/RemoveRedEye";
import { useMediaQuery, useTheme } from "@mui/material";

export const ActionsField: React.FC<{
  id: string | number;
  resource: string;
  actions: Set<"edit" | "show" | "delete">;
}> = ({ id, actions, resource }) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("sm"));
  const createPath = useCreatePath();
  const redirect = useRedirect();

  if (!actions?.size) {
    throw getError({ message: "Invalid actions to create action field!" });
  }

  return (
    <ButtonGroup sx={{ backgroundColor: "#924653" }}>
      {actions.has("edit") && (
        <Button
          color="secondary"
          onClick={() => {
            const redirectUrl = createPath({
              type: "edit",
              resource,
              id,
            });
            redirect(redirectUrl);
          }}
        >
          <ContentCreate
            fontSize={matches ? "small" : "medium"}
            sx={{
              mr: matches ? 2 : 0,
              ml: matches ? -0.5 : 0,
            }}
          />
          {matches && "Edit"}
        </Button>
      )}

      {actions.has("show") && (
        <Button
          color="success"
          onClick={() => {
            const redirectUrl = createPath({
              type: "show",
              resource,
              id,
            });
            redirect(redirectUrl);
          }}
        >
          <ImageEye
            fontSize={matches ? "small" : "medium"}
            sx={{
              mr: matches ? 2 : 0,
              ml: matches ? -0.5 : 0,
            }}
          />
          {matches && "Show"}
        </Button>
      )}

      {actions.has("delete") && (
        <DeleteButton color="error" sx={{ color: "#fff" }} />
      )}
    </ButtonGroup>
  );
};
