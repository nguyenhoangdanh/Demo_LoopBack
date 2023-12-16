import {
  Button,
  Grid,
  Paper,
  Stack,
  useTheme,
  CardMedia,
  DialogTitle,
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Theme,
  Input,
  InputLabel,
} from "@mui/material";
import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  MutableRefObject
} from "react";
import Webcam from "react-webcam";
import {
  useCreate,
  useNotify,
  Loading,
  useGetOne,
  useRefresh,
} from "react-admin";
import ReplayIcon from "@mui/icons-material/Replay";
import { BASE_URL, FACE_IPEG, IPopupAvartar, PATH } from "@/common";
import { compressImage, convertBase64ToFile } from "@/utilities";
import { isEmpty } from "lodash";
import AvatarIcon from "@/assets/image/avatar-modification.svg";
import { makeStyles } from "@mui/styles";
import { LbProviderGetter } from "@/helpers";

const useStyles: any = makeStyles((theme: Theme) => {
  const { spacing } = theme;
  return {
    root: {
      margin: `${spacing(3)} ${spacing(2)}`,
    },
    title: {
      paddingTop: spacing(2),
      paddingLeft: spacing(5),
    },
  };
});

interface ImageAvatarProps {
  src: string;
  alt: string;
}
const ImageAvatar: React.FC<ImageAvatarProps> = ({ src, alt }) => {
  const imgSource = src
    ? { src: `${BASE_URL}/static-assets/${src}` }
    : { image: `${AvatarIcon}` };

  return (
    <Box display="flex" alignItems="center" justifyContent="center">
      <CardMedia
        component="img"
        sx={{ width: "300px", height: "300px", borderRadius: "50%" }}
        alt={alt}
        {...imgSource}
      />
    </Box>
  );
};



//--------------------------------------------------------------------------------

export const UpdateAvatar = (props: IPopupAvartar) => {
  const { open, onClose } = props;
  const [imgLink, setImgLink] = useState<string>("");
  const [imgBase64, setImgBase64] = useState<string | null>("");
  const [isSavingImg, setIsSavingImg] = useState<boolean>(false);
  const [selected, setSelected] = useState<number>(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const webcamRef: MutableRefObject<Webcam | null> = useRef(null);
  const id = localStorage.getItem("userId");


  const [create] = useCreate();
  const notify = useNotify();
  const refresh = useRefresh();
  const theme = useTheme();

  const { data: myprofile, isLoading: myprofileLoading } = useGetOne(
    PATH.USERS,
    {
      id: `${id}`,
      meta: {
        filter: {
          include: [
            "profile",
            "roles",
            "departments",
            "positions",
            "identifiers",
          ],
        },
      },
    },
    { enabled: Boolean(id) }
  );

  const videoConstraints = {
    width: 400,
    height: 400,
    marginLeft: 24,
  };

  const handleSave = async () => {
    const postAvatar = {
      avatarImageUrl: imgLink,
    };
    const validate = validateForm();
    if (validate.result) {
      await LbProviderGetter({ baseUrl: BASE_URL }).send(
        `${PATH.USERS}/${id}/${PATH.UPDATE_AVATAR}`,
        {
          method: "patch",
          data: postAvatar,
        })
        .then((res: any) => {
     
            notify('Update avatar successfully!', { type: "success" });
            onClose();
            setImgBase64(null);
            setSelected(1);
            refresh();
        })
        .catch(error =>
          notify('Update avatar failed!', { type: "error" }));
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
        message: "Please choose a file or take a photo",
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
      `${PATH.META_LINK}/${PATH.AVATAR}/${PATH.UPLOAD}`,
      { data: postCreation, meta: { bodyType: "file" } },
      {
        onSuccess: (res) => {
          const imgUrlRes = res[0];
          setImgLink(imgUrlRes);
          setIsSavingImg(false);
        },
        onError: () => {
          setIsSavingImg(false);
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
    if (open === false) {
      setImageFile(null)
    }
  }, [open])

  useEffect(() => {
    if (imageFile) {
      handleSaveImage();
    }
  }, [imageFile]);

  const handleImage = async (e: any) => {
    const file: any = e.target.files[0];
    const MAX_FILE_SIZE = 5120 // 5MB
    const fileSize = file.size / 1024
    if (fileSize > MAX_FILE_SIZE) {
      notify("File size is greater than maximum limit", { type: "error" });
      setImageFile(null);
    } else {
      setImageFile(file);
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <Box display='flex' alignItems='center' justifyContent='center'>
        <DialogTitle>Change Avatar</DialogTitle>
      </Box>
      <Box display='flex' alignItems='center' justifyContent='space-evenly' >
        <InputLabel
          style={{ fontWeight: 'bold', cursor: 'pointer' }}
          onClick={() => setSelected(1)}>
          Upload a file
        </InputLabel>
        <InputLabel
          style={{ fontWeight: 'bold', cursor: 'pointer' }}
          onClick={() => setSelected(2)}>
          Take a photo
        </InputLabel>
        <InputLabel
          style={{
            position: 'absolute',
            background: 'red',
            height: '4px',
            width: '50%',
            top: 90,
            left: (selected == 1 ? 0 : '50%')
          }} />
      </Box>
      <Paper
        sx={{ margin: `${theme.spacing(5)} ${theme.spacing(5)}` }}
        elevation={3}
      >
        <Stack width="100%" direction="column" padding={theme.spacing(2)}>
          {selected === 1 ? (
            <DialogContent>
              <Box display="flex" flexDirection="column" alignItems="center">
                {imageFile ? (
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="avatar" width='300px' height='300px' style={{ borderRadius: '50%' }}
                  />
                ) : (
                  <ImageAvatar
                    src={myprofile?.profile?.avatarImageUrl}
                    alt="Avatar"
                  />
                )}
              </Box>
              <Box marginTop={theme.spacing(2)}>
                <InputLabel>Upload a file</InputLabel>
                <Input type="file" onChange={handleImage} inputProps={{ accept: '.jpg, .png, .jpeg' }} />
              </Box>
            </DialogContent>
          ) : (
            <Grid sx={{ margin: `${theme.spacing(6)}`, display: 'flex' }}>
              {!imgBase64 ? (
                <Stack direction="column" alignItems="flex-end">
                  <Webcam
                    audio={false}
                    mirrored={true}
                    height={300}
                    width={300}
                    style={{ borderRadius: '50%' }}
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
                    style={{ borderRadius: '50%' }}
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
          )}
        </Stack>
      </Paper>
      <DialogActions>
        <Button color="primary" variant="contained" onClick={handleSave}>
          Save
        </Button>
        <Button color="inherit" onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

