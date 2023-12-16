import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { IssueDialogType, PATH } from "@/common";
import { useNavigate } from "react-router-dom";

interface IssueDialogProps {
  open: boolean;
  handleClose: () => void;
  dialogType: IssueDialogType;
}

const IssueDialog: React.FC<IssueDialogProps> = ({
  open,
  handleClose,
  dialogType,
}) => {
  const navigate = useNavigate();

  const dialogContents = {
    [IssueDialogType.BACK]: {
      title: "Unsaved Changes Detected",
      description:
        "You've made changes to an issue in the HRM system. If you proceed without updating, all your edits will be discarded, and the original data will remain unchanged.",
      actions: (
        <>
          <Button color="primary" onClick={handleClose}>
            Go Back and Update
          </Button>
          <Button
            color="error"
            onClick={() => navigate(`/${PATH.ISSUES}`)}
            autoFocus
          >
            Continue Without Saving
          </Button>
        </>
      ),
    },
    [IssueDialogType.UPDATE]: {
      title: "No Changes Detected",
      description:
        "The information you are trying to update appears to be identical to the existing data. It's important to make meaningful changes before submitting an update.\nPlease review your changes and ensure that at least one field has been modified.",
      actions: (
        <Button color="primary" onClick={handleClose}>
          Cancel
        </Button>
      ),
    },
  };

  const currentDialog = dialogContents[dialogType];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{currentDialog.title}</DialogTitle>
      <DialogContent>
        <DialogContentText
          id="alert-dialog-description"
          style={{ whiteSpace: "pre-line" }}
        >
          {currentDialog.description}
        </DialogContentText>
      </DialogContent>
      <DialogActions>{currentDialog.actions}</DialogActions>
    </Dialog>
  );
};

export default IssueDialog;
