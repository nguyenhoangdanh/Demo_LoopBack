import { BASE_URL, ITag, PATH, ROLES } from "@/common";
import {
  Button,
  Paper,
  TextField,
  Typography,
  Stack,
  useTheme,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@mui/material";
import { ChangeEvent, useCallback, useEffect } from "react";
import { Fragment, useState } from "react";
import { Loading, useCreate, useNotify, usePermissions } from "react-admin";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";
import { LbProviderGetter } from "@/helpers";

export const CreateTag = (props: { open: boolean; onClose: () => void }) => {
  const { open, onClose } = props;
  const [create] = useCreate();
  const notify = useNotify();
  const theme = useTheme();
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [tags, setTags] = useState<ITag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTag, setSelectedTag] = useState<ITag | null>(null);
  const { permissions } = usePermissions();

  const clearCreateTag = () => {
    setName("");
    setDescription("");
  };

  const handleSelectTag = useCallback(
    (value: ITag) => {
      setSelectedTag(value);
    },
    [selectedTag]
  );

  const handleUpdateTag = useCallback(async () => {
    const tagRes: any = await LbProviderGetter({ baseUrl: BASE_URL }).send(
      `${PATH.TAGS}/${selectedTag?.id}`,
      { method: "patch", data: selectedTag }
    );
    const updatedTag: ITag = tagRes.data;

    if (updatedTag) {
      setTags((prev) =>
        prev.map((tag) => (tag.id === updatedTag.id ? updatedTag : tag))
      );
      setSelectedTag(null);
    }
  }, [selectedTag]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSelectedTag((prev) => ({
      ...prev!,
      [id]: value,
    }));
  };

  const handleCreate = () => {
    setIsLoading(true);
    const postTag = {
      name,
      code: name,
      description,
    };

    if (name && description) {
      create(
        PATH.TAGS,
        { data: postTag },
        {
          onSuccess: (res) => {
            notify("Successful create!", { type: "success" });
            setIsLoading(false);
            getTags();
            clearCreateTag();
          },
          onError: () => {
            notify("Create failed !", { type: "error" });
            setIsLoading(false);
          },
        }
      );
    }
  };

  const getTags = useCallback(async () => {
    const tagsRes: any = await LbProviderGetter({ baseUrl: BASE_URL }).send(
      `${PATH.TAGS}`,
      { method: "get", query: {} }
    );
    const tags: ITag[] = tagsRes.data;
    setTags(tags);
  }, []);

  const deleteTagById = useCallback(async (tagId: number) => {
    setIsLoading(true);
    await LbProviderGetter({ baseUrl: BASE_URL }).send(
      `${PATH.TAGS}/${tagId}`,
      { method: "delete" }
    );
    setIsLoading(false);
    getTags();
  }, []);

  useEffect(() => {
    getTags();
    setIsLoading(false);
  }, [isLoading]);

  return isLoading ? (
    <Loading />
  ) : (
    <Fragment>
      <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth={"xl"}>
        <DialogTitle>
          <Stack flexDirection="row" justifyContent="space-between">
            <Box>Tag</Box>
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent
          sx={{
            mx: `${theme.spacing(7)}`,
            mb: `${theme.spacing(3)}`,
          }}
        >
          {!permissions.includes(ROLES.EMPLOYEE) && (
            <Stack
              width="100%"
              direction="row"
              justifyContent="flex-start"
              alignItems="center"
              sx={{ marginTop: theme.spacing(2) }}
            >
              <Typography
                fontSize={25}
                fontWeight={600}
                marginRight={theme.spacing(20)}
              >
                Create Tag
              </Typography>
              <Stack
                display="flex"
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <TextField
                  label="Name"
                  variant="outlined"
                  sx={{ width: "100%", marginRight: theme.spacing(5) }}
                  onChange={(e) => setName(e.target.value)}
                  inputProps={{ maxLength: 64 }}
                />
                <TextField
                  label="Description"
                  variant="outlined"
                  sx={{ width: "100%", marginRight: theme.spacing(5) }}
                  onChange={(e) => setDescription(e.target.value)}
                  inputProps={{ maxLength: 64 }}
                />
                <Button
                  onClick={handleCreate}
                  disabled={name === "" || description === ""}
                >
                  Create
                </Button>
              </Stack>
            </Stack>
          )}
          <Box
            sx={{
              width: "90%",
              height: theme.spacing(0.125),
              backgroundColor: "#000",
              margin: `${theme.spacing(5)} 0`,
            }}
          ></Box>
          <Stack
            width="100%"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            <Typography
              fontSize={25}
              fontWeight={600}
              marginBottom={theme.spacing(5)}
            >
              Tags
            </Typography>
            <TableContainer component={Paper} sx={{ maxHeight: "550px" }}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      Name
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      Description
                    </TableCell>
                    {!permissions.includes(ROLES.EMPLOYEE) && (
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 700 }}
                        width={"15%"}
                      >
                        Edit/Update
                      </TableCell>
                    )}
                    {!permissions.includes(ROLES.EMPLOYEE) && (
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 700 }}
                        width={"15%"}
                      >
                        Delete
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tags?.map((item: ITag, index: number) => (
                    <TableRow key={index}>
                      <TableCell align="center">
                        {item.id !== selectedTag?.id ? (
                          <Box>{item?.name}</Box>
                        ) : (
                          <TextField
                            id="name"
                            label="Name"
                            value={selectedTag?.name || ""}
                            variant="outlined"
                            onChange={handleChange}
                            inputProps={{ maxLength: 64 }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {item.id !== selectedTag?.id ? (
                          <Box>{item?.description}</Box>
                        ) : (
                          <TextField
                            id="description"
                            label="Description"
                            value={selectedTag?.description || ""}
                            variant="outlined"
                            onChange={handleChange}
                            inputProps={{ maxLength: 64 }}
                          />
                        )}
                      </TableCell>
                      {!permissions.includes(ROLES.EMPLOYEE) && (
                        <TableCell align="center">
                          {item.id !== selectedTag?.id ? (
                            <Button
                              color="secondary"
                              onClick={() => handleSelectTag(item)}
                            >
                              <ModeEditOutlineIcon />
                              <Box marginLeft={theme.spacing(1)}>Edit</Box>
                            </Button>
                          ) : (
                            <Button onClick={handleUpdateTag} color="success">
                              <CheckIcon />
                              <Box marginLeft={theme.spacing(1)}>Update</Box>
                            </Button>
                          )}
                        </TableCell>
                      )}
                      {!permissions.includes(ROLES.EMPLOYEE) && (
                        <TableCell align="center">
                          <Button
                            onClick={() => deleteTagById(item.id)}
                            color="error"
                          >
                            <DeleteIcon />
                            <Box marginLeft={theme.spacing(1)}>Delete</Box>
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};
