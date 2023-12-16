import {
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  Stack,
  Autocomplete,
  useTheme,
  CardMedia,
} from "@mui/material";
import {
  useState,
  useCallback,
  useRef,
  useEffect,
  MutableRefObject,
  Fragment,
} from "react";
import Webcam from "react-webcam";
import {
  useCreate,
  useNotify,
  Loading,
  usePermissions,
  NotFound,
} from "react-admin";
import { useNavigate } from "react-router";
import ReplayIcon from "@mui/icons-material/Replay";
import { FACE_IPEG, PATH, ROLES } from "@/common";
import { compressImage, convertBase64ToFile } from "@/utilities";
import { isEmpty } from "lodash";

export const CreateUser = () => {
  const [username, setUsername] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [imgLink, setImgLink] = useState<string>("");
  const [imgBase64, setImgBase64] = useState<string | null>("");
  const [roleOption, setRoleOption] = useState<Array<string>>([ROLES.EMPLOYEE]);
  const [isSavingImg, setIsSavingImg] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const webcamRef: MutableRefObject<Webcam | null> = useRef(null);

  const [create] = useCreate();
  const notify = useNotify();
  const navigate = useNavigate();
  const theme = useTheme();
  const { permissions } = usePermissions();

  const videoConstraints = {
    width: 400,
    height: 400,
    marginLeft: 24,
  };

  const handleCreate = () => {
    const postUser = {
      username,
      fullName,
      face_img_url: imgLink,
      role: roleOption,
    };

    const validate = validateForm();
    if (validate.result) {
      create(
        `${PATH.AUTH}/${PATH.SIGN_UP}`,
        { data: postUser, meta: { bodyType: "" } },
        {
          onSuccess: () => {
            notify("Successful create!", { type: "success" });
            navigate(`/${PATH.USERS}`);
          },
          onError: () => {
            notify("Create failed !", { type: "error" });
          },
        }
      );
    } else {
      notify(validate.message, {
        type: "error",
      });
    }
  };
  const validateForm = (): { result: boolean; message: string } => {
    const rs = {
      result: true,
      message: "",
    };

    if (isEmpty(imgLink)) {
      return {
        result: false,
        message: "Can't recognize face image",
      };
    }

    if (isEmpty(username)) {
      return {
        result: false,
        message: "User Name is not empty",
      };
    }

    if (username.length <= 8) {
      return {
        result: false,
        message: "User Name must be at least 8 characters long",
      };
    }

    if (isEmpty(fullName)) {
      return {
        result: false,
        message: "Full Name is not empty",
      };
    }

    if (isEmpty(roleOption)) {
      return {
        result: false,
        message: "Role is not empty",
      };
    }

    return rs;
  };

  const handleSaveImage = useCallback(() => {
    setIsSavingImg(true);
    const postCreation = {
      file: imageFile,
    };

    create(
      `${PATH.META_LINK}/${PATH.EMPLOYEE}/${PATH.UPLOAD}`,
      { data: postCreation, meta: { bodyType: "file" } },
      {
        onSuccess: (res) => {
          const imgUrlRes = res[0];

          setImgLink(imgUrlRes);

          notify("Save Successful!", { type: "success" });
          setIsSavingImg(false);
        },
        onError: () => {
          setIsSavingImg(false);
          notify("Identify failed!", { type: "error" });
        },
      }
    );
  }, [imageFile]);

  const handleCapture = async () => {
    if (webcamRef.current) {
      const imageSrc: string | null = webcamRef?.current?.getScreenshot();
      setImgBase64(imageSrc);
      const imgFile = imageSrc
        ? convertBase64ToFile(imageSrc, FACE_IPEG)
        : null;
      setImgBase64(imageSrc);
      const compressedImg = await compressImage(imgFile!);
      setImageFile(compressedImg);
     
    }
  };

  useEffect(() => {
    if (!permissions.includes(ROLES.EMPLOYEE) && imageFile) {
      handleSaveImage();
    }
  }, [imageFile]);

  return isCreating ? (
    <Loading />
  ) : (
    <Fragment>
      {permissions.includes(ROLES.EMPLOYEE) ? (
        <NotFound />
      ) : (
        <Paper
          sx={{ margin: `${theme.spacing(5)} ${theme.spacing(3.75)}` }}
          elevation={3}
        >
          <Stack width="100%" direction="column" padding={theme.spacing(6.25)}>
            <Typography fontSize={25} fontWeight={600}>
              Create User
            </Typography>
            <Grid container spacing={5}>
              <Grid item xs={12} md={6} marginTop={theme.spacing(3)}>
                {!imgBase64 ? (
                  <Stack direction="column" alignItems="flex-end">
                    <Webcam
                      audio={false}
                      mirrored={true}
                      height={300}
                      width={300}
                      frameBorder={"4px"}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={videoConstraints}
                    />
                    {isSavingImg ? (
                      <Loading />
                    ) : (
                      <Button
                        color="success"
                        sx={{ width: "300px", marginTop: theme.spacing(2) }}
                        onClick={handleCapture}
                      >
                        Capture photo
                      </Button>
                    )}
                  </Stack>
                ) : (
                  <Stack direction="column" alignItems="flex-end">
                    <CardMedia
                      component="img"
                      image={imgBase64 ?? ""}
                      sx={{ width: "300px", height: "300px" }}
                      alt="screenshot"
                    />
                    <Button
                      color="inherit"
                      sx={{ width: "300px", marginTop: theme.spacing(2) }}
                      onClick={() => setImgBase64("")}
                    >
                      <ReplayIcon />
                    </Button>
                  </Stack>
                )}
              </Grid>
              <Grid
                item
                xs={12}
                md={6}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="flex-start"
              >
                <TextField
                  label="Username"
                  variant="outlined"
                  sx={{ width: "60%", marginTop: theme.spacing(3) }}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <TextField
                  label="Fullname"
                  variant="outlined"
                  sx={{ width: "60%", marginTop: theme.spacing(3) }}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <Autocomplete
                  defaultValue={ROLES.OPTIONS.find(
                    (option) => option.id === ROLES.EMPLOYEE
                  )}
                  onChange={(e, value) =>
                    setRoleOption(value ? [value.id] : [])
                  }
                  options={ROLES.OPTIONS}
                  getOptionLabel={(option) => (option && option?.name) ?? "N/A"}
                  sx={{ width: "60%", marginTop: theme.spacing(3) }}
                  renderInput={(params: any) => (
                    <TextField {...params} variant="outlined" label="Role" />
                  )}
                />
              </Grid>
            </Grid>
            <Grid
              container
              spacing={5}
              marginTop={theme.spacing(10)}
              justifyContent="center"
            >
              <Grid item xs={4} paddingTop={"0px !important"}>
                <Button onClick={handleCreate}>Create</Button>
              </Grid>
              <Grid item xs={4} paddingTop={"0px !important"}>
                <Button
                  color="error"
                  onClick={() => navigate(`/${PATH.USERS}`)}
                >
                  Back
                </Button>
              </Grid>
            </Grid>
          </Stack>
        </Paper>
      )}
    </Fragment>
  );
};
