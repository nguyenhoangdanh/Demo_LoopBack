import { IconButton } from "@mui/material";
import { useDelete, useRecordContext } from "react-admin";
import DeleteIcon from "@mui/icons-material/Delete";

export const DeleteIssue = () => {
  const record = useRecordContext();
  const [deleteOne, { isLoading, error }] = useDelete();
  const handleClick = () => {
    deleteOne("likes", { id: record.id, previousData: record });
  };
  if (error) {
    return <p>ERROR</p>;
  }
  return (
    <IconButton
      disabled={isLoading}
      edge="end"
      aria-label="delete"
      onClick={handleClick}
    >
      <DeleteIcon />
    </IconButton>
  );
};
