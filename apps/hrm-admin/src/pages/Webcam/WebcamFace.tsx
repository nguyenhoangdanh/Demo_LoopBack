import Webcam from "react-webcam";
import dayjs from "dayjs";
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button, CardMedia, Grid, Stack, useTheme } from "@mui/material";
import { BASE_URL, FACE_IPEG, ICheckIn, ILocation, PATH } from "../../common";
import { useNotify, useCreate, Loading } from "react-admin";
import { compressImage, convertBase64ToFile } from "../../utilities";
import ReplayIcon from "@mui/icons-material/Replay";
import { GeoMap } from "./GeoMap/GeoMap";
import { CheckIn } from "./CheckIn";
import { Identify } from "./Identify";
import { LbProviderGetter } from "@/helpers";
import { useNavigate } from "react-router-dom";

interface IData {
  data: {
    data: Array<any>;
  };
}

export const WebcamFace = () => {
  const initialData: ICheckIn = {
    id: "",
    fullname: "Unknown",
    checkInTime: "",
    latitude: 0,
    longitude: 0,
    address: "",
  };
  const notify = useNotify();
  const navigate = useNavigate();
  const [imgBase64, setImgBase64] = useState<string | null>("");
  const [location, setLocation] = useState<ILocation>();
  const webcamRef: MutableRefObject<Webcam | null> = useRef(null);
  const [fileBuffer, setFileBuffer] = useState<File | null>(null);
  const [checkInRes, setCheckInRes] = useState<ICheckIn>(initialData);
  const [addressMap, setAddressMap] = useState("");
  const [loading, setLoading] = useState(true);
  const [create] = useCreate();
  const theme = useTheme();
  const videoConstraints = {
    width: 400,
    height: 400,
    marginLeft: 24,
  };

  const resetCheckInState = () => {
    setCheckInRes(initialData);
    locationPosition();
    setImgBase64("");
  };

  //---------------------------------
  const handleCapture = async () => {
    if (webcamRef.current) {
      const imageSrc: string | null = webcamRef.current.getScreenshot();
      const imageFile = imageSrc
        ? convertBase64ToFile(imageSrc, FACE_IPEG)
        : null;
      setImgBase64(imageSrc);
      const compressedImg = await compressImage(imageFile!);
      setFileBuffer(compressedImg);
    }
  };

  //---------------------------------
  const handleReloadCapture = useCallback(() => {
    setImgBase64("");
  }, []);

  //---------------------------------
  const getLatestSession = useCallback(async () => {
    const data = await LbProviderGetter({
      baseUrl: BASE_URL,
    }).send("attendances", {
      method: "get",
      query: {
        filter: {
          where: {
            userId: localStorage.getItem("userId"),
            createdAt: {
              between: [
                dayjs(new Date()).startOf("day").toString(),
                dayjs(new Date()).endOf("day").toString(),
              ],
            },
            checkOutTime: null,
          },
          include: [
            {
              relation: "user",
              scope: {
                include: [
                  {
                    relation: "profile",
                  },
                ],
              },
            },
          ],
        },
      },
    });

    const parseData = (data as IData).data.data[0];

    parseData
      ? setCheckInRes({
          id: parseData.id,
          latitude: parseData.coordinates.lat,
          longitude: parseData.coordinates.lng,
          fullname: parseData.user.profile.fullName,
          checkInTime: parseData.createdAt,
          ...parseData,
        })
      : locationPosition();

    setLoading(false);
  }, []);

  //---------------------------------
  const successCallback = useCallback(
    (position: any) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date(position.timestamp).toISOString(),
      });
    },
    [location]
  );
  //---------------------------------
  const errorCallback = useCallback(() => {
    notify("Location failed!", { type: "error" });
  }, []);

  const locationPosition = useCallback(() => {
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  }, []);

  //---------------------------------
  const getReverseGeocoding = async (
    latitude?: number,
    longitude?: number
  ): Promise<string> => {
    if (!latitude || !longitude) {
      return "";
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );
      const data = await response.json();
      const { address } = data ?? {};
      const { house_number, road, suburb, city, country } = address ?? {};

      const addressParts = [house_number, road, suburb, city, country].filter(
        Boolean
      );
      const fullAddress = addressParts.join(", ");

      return fullAddress;
    } catch (error) {
      console.error(
        "getReverseGeocoding Error occurred while getting reverse geocoding:",
        error
      );
      return "";
    }
  };
  const handleAuthenIdentify = useCallback(() => {
    if (location?.latitude === undefined && location?.longitude === undefined) {
      notify("Location unknown, check-in failed.", { type: "error" });
      return;
    }
    setLoading(true);

    const postCheckin = {
      file: fileBuffer,
      address: addressMap,
      lat: location?.latitude,
      lng: location?.longitude,
    };

    create(
      "check-in/",
      { data: postCheckin, meta: { bodyType: "file" } },
      {
        onSuccess: (res) => {
          const { fullname } = res;

          if (fullname !== "Unknown") {
            setCheckInRes({
              latitude: res.coordinates.lat,
              longitude: res.coordinates.lng,
              ...res,
            });
            notify("Successful Identify!", { type: "success" });
            navigate(`/${PATH.ATTENDANCE}`);
          } else {
            notify("User unknown, check-in failed.", { type: "error" });
          }
          setLoading(false);
        },
        onError: () => {
          setLoading(false);
          notify("Identify failed!", { type: "error" });
        },
      }
    );
  }, [fileBuffer, addressMap, location]);

  useEffect(() => {
    getReverseGeocoding(location?.latitude, location?.longitude).then(
      (result) => {
        setAddressMap(result);
      }
    );
  }, [location?.latitude, location?.longitude]);

  //---------------------------------
  useEffect(() => {
    getLatestSession();
  }, []);

  return loading ? (
    <Loading />
  ) : (
    <Stack direction="column" marginTop={theme.spacing(3)}>
      {checkInRes.fullname === "Unknown" ? (
        <Stack direction="row" justifyContent="center">
          {!imgBase64 ? (
            <Stack direction="column" spacing={3}>
              <Webcam
                audio={false}
                mirrored={true}
                height={400}
                width={400}
                frameBorder={theme.spacing(0.5)}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
              />
              <Button onClick={handleCapture}>Capture photo</Button>
            </Stack>
          ) : (
            <Stack direction="column" spacing={3}>
              <CardMedia
                component="img"
                image={imgBase64 ?? ""}
                sx={{ width: "400px", height: "400px" }}
                alt="screenshot"
              />
              <Grid container alignItems="flex-end">
                <Grid item xs={10} paddingRight={3}>
                  <Identify callback={handleAuthenIdentify} />
                </Grid>
                <Grid item xs={2}>
                  <Button color="inherit" onClick={handleReloadCapture}>
                    <ReplayIcon />
                  </Button>
                </Grid>
              </Grid>
            </Stack>
          )}
          {location && (
            <GeoMap
              latitude={location!.latitude}
              longitude={location!.longitude}
              addressMap={addressMap}
            />
          )}
        </Stack>
      ) : (
        <CheckIn opts={checkInRes} resetState={resetCheckInState} />
      )}
    </Stack>
  );
};
