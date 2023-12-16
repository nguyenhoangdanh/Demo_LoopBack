import { PATH } from "@/common";
import { Box, Button, ButtonGroup, Grid, Typography } from "@mui/material";
import { CreateButton } from "react-admin";
import { CreateTag } from "./Tags/ManageTag";
import { useState, useCallback } from "react";
import TagIcon from "@mui/icons-material/Tag";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";

export const EmptyIssue = () => {
  const [openTag, setOpenTag] = useState(false);
  const toggleOpenTag = useCallback((option: { mode: boolean }) => {
    setOpenTag(option.mode);
  }, []);
  return (
    <Grid container spacing={2} sx={{ height: "100%" }}>
      <Grid
        container
        item
        xs={12}
        sx={{ justifyContent: "center", alignItems: "center" }}
      >
        <HistoryEduIcon sx={{ fontSize: "200px" }} />
      </Grid>
      <Grid container item xs={12} sx={{ justifyContent: "center" }}>
        <Typography variant="h4" paragraph>
          No issue available
        </Typography>
      </Grid>
      <Grid container item xs={12} sx={{ justifyContent: "center" }}>
        <Typography variant="body1">Create one or manage tags</Typography>
      </Grid>
      <Grid container item xs={12} sx={{ justifyContent: "center" }}>
        <ButtonGroup orientation="vertical" color="inherit">
          <CreateButton />
          <Button
            onClick={() => toggleOpenTag({ mode: true })}
            color="warning"
            sx={{
              height: "27px !important",
              padding: "4px 10px !important",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              margin: "8px 0px",
            }}
          >
            <TagIcon sx={{ width: "1.2rem", height: "1.2rem" }} />
            Tag
          </Button>
        </ButtonGroup>
      </Grid>
      <CreateTag
        onClose={() => toggleOpenTag({ mode: false })}
        open={openTag}
      />
    </Grid>
  );
};
