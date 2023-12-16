import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import { ChangeEvent, useCallback, useState } from "react";
import { IDepartmentDaysOff, IUserDepartmentData, PATH } from "@/common";
import { ButtonGroup, TextField } from "@mui/material";
import { useDataProvider } from "ra-core";

interface IUserDaysOffProps {
  item:
    | (IUserDepartmentData & {
        spentDayOff?: number;
        totalDayOff?: number;
        year?: number;
        id?: number;
      })
    | IDepartmentDaysOff;
}

let title = "Update Total Days Off User";
let titleButton = "Update";
let cancel = "Cancel";
let save = "save";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const styleTextFiedl = {
  marginTop: "5%",
  width: "100%",
};

const styleButtonGroup = {
  margin: "auto",
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  boxShadow: 0,
};

const styleButton = {
  width: "30%",
  margin: "10px",
};

export const UpdateDaysOffUserModal: React.FC<IUserDaysOffProps> = ({
  item,
}) => {
  const [open, setOpen] = useState(false);
  const [itemInput, setItemInput] = useState({
    totalDayOff: "",
  });
  const [isInputFocused, setIsInputFocused] = useState(false);
  const dataProvider = useDataProvider();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleTotalDayOffChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    if (!isNaN(Number(newValue))) {
      setItemInput({ ...item, totalDayOff: newValue });
    }
  };
  const handleInputFocus = () => {
    setItemInput({ ...item, totalDayOff: "" });
    setIsInputFocused(true);
  };

  const handleUpdateDaysOff = useCallback(async () => {
    const postUserDaysOff = {
      userId: item.profile.userId,
      totalDayOff: Number(itemInput.totalDayOff),
      year: item.year,
      id: item.id,
    };
    const resUserDaysOff = await dataProvider.send(
      PATH.DAYS_OFF + `/${item.id}`,
      {
        method: "PUT",
        data: postUserDaysOff,
      }
    );
    if (resUserDaysOff) {
      console.log("Thanh cong");
    }
    handleClose();
  }, [itemInput.totalDayOff]);

  return (
    <div>
      <Button onClick={handleOpen}>{titleButton}</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h3 style={{ textAlign: "center" }}>{title}</h3>
          <TextField
            sx={styleTextFiedl}
            disabled={true}
            value={item.id}
            label={"ID User"}
          />
          <TextField
            sx={styleTextFiedl}
            disabled={true}
            value={item.profile.fullName}
            label={"Full Name"}
          />
          <TextField
            sx={styleTextFiedl}
            disabled={true}
            value={item.spentDayOff ?? 0}
            label={"Spent Days Off"}
          />
          <TextField
            sx={styleTextFiedl}
            onChange={handleTotalDayOffChange}
            onFocus={handleInputFocus}
            label={"Total Days Off"}
          />
          <ButtonGroup
            variant="contained"
            aria-label="outlined primary button group"
            sx={styleButtonGroup}
          >
            <Button
              sx={styleButton}
              onClick={handleUpdateDaysOff}
              style={{ backgroundColor: "green" }}
            >
              {save}
            </Button>
            <Button
              sx={styleButton}
              style={{ backgroundColor: "red" }}
              onClick={handleClose}
            >
              {cancel}
            </Button>
          </ButtonGroup>
        </Box>
      </Modal>
    </div>
  );
};
