import { Button, ButtonGroup, Popover } from "@mui/material";
import { Root } from ".";
import { BASE_URL, ISSUES_STATUS, ITag, PATH } from "@/common";
import ColoredTag from "./ColoredTag";
import { useEffect, useState } from "react";
import { LbProviderGetter } from "@/helpers";
import { get } from "lodash";

export default function Selection({
  record,
  selectionValues,
}: {
  record: any;
  selectionValues: ITag[];
}) {
  const [selectedTag, setSelectedTag] = useState<ITag>(record?.status);
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  const handleOpenSelections = (event: React.MouseEvent<HTMLDivElement>) => {
    if (selectionValues.length > 0) {
      setAnchorEl(event.currentTarget);
    }
  };

  useEffect(() => {
    if (record?.status !== selectedTag) {
      setSelectedTag(record?.status);
    }
  }, [record]);

  const handleSelectOption = async (tag: ITag) => {
    setSelectedTag(tag);
    const res: any = await LbProviderGetter({ baseUrl: BASE_URL }).send(
      `${PATH.ISSUES}/${record.id}`,
      {
        method: "patch",
        data: { statusId: tag.id },
      }
    );
    if (res?.data) {
      setSelectedTag(
        selectionValues.find((value) => res.data.statusId === value.id)!
      );
      handleClose();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? "popup-button" : undefined;

  return (
    <Root>
      <div onClick={(e) => handleOpenSelections(e)}>
        <ColoredTag name={selectedTag.name} />
      </div>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <ButtonGroup orientation="vertical" variant="contained">
          {selectionValues.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleSelectOption(option)}
              sx={{
                backgroundColor: get(ISSUES_STATUS.COLOR, option.name)?.default,
                "&:hover": {
                  backgroundColor: get(ISSUES_STATUS.COLOR, option.name)?.hover,
                },
              }}
            >
              {option.name}
            </Button>
          ))}
        </ButtonGroup>
      </Popover>
    </Root>
  );
}
