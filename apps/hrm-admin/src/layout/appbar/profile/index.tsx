import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useGetOne, useNotify, useRefresh, useUpdate } from "react-admin";
import {
  Paper,
  Typography,
  Button,
  Grid,
  Theme,
  useTheme,
  Box,
  CardMedia,
  TextField,
  ButtonGroup,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import AvatarIcon from "@/assets/image/avatar-modification.svg";
import { TextFieldCustom, PopupChangePassword } from "@/components/common";
import { formatTimeToYMD } from "@/utilities";
import { BASE_URL, EMPLOYEES_STATUS, PATH } from "@/common";
import get from "lodash/get";
import { UpdateAvatar } from "./UpdateAvatar";
import { FaCamera } from "react-icons/fa";
import { isEmpty } from "lodash";
import { LbProviderGetter } from "@/helpers";

const useStyles: any = makeStyles((theme: Theme) => {
  const { spacing } = theme;
  return {
    root: {
      margin: `${spacing(3)} ${spacing(2)}`,
      padding: theme.spacing(5),
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
const ChangePassword: React.FC<{}> = () => {
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <Button color="secondary" onClick={() => {
        setOpen(true);
      }}>Change Password</Button>

      <PopupChangePassword open={open} onClose={() => {
        setOpen(false);
      }} />
    </React.Fragment>
  )
}

//--------------------------------------------------------------------------------
const UserAvatar: React.FC<{ profile: { avatarImageUrl: string; fullName: string;[extra: symbol | string]: any } }> = ({ profile }) => {
  const [openAvatar, setOpenAvatar] = useState(false);
  return (
    <React.Fragment>
      <Box display="flex" flexDirection="column" alignItems="center">
        <ImageAvatar
          src={profile.avatarImageUrl}
          alt="Avatar"
        />
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          bgcolor='lightgray'
          width='45px'
          height='45px'
          borderRadius='50%'
          position='relative'
          bottom='60px'
          left='95px'
          onClick={() => {
            setOpenAvatar(true)
          }}
        >
          <FaCamera
            size={25} cursor='pointer' color="black"
            onClick={() => {
              setOpenAvatar(true)
            }}
          />
        </Box>
        <Typography variant="h6" marginTop={(theme) => theme.spacing(1)}>
          {profile?.fullName ?? "-"}
        </Typography>
      </Box>

      <UpdateAvatar open={openAvatar} onClose={() => {
        setOpenAvatar(false);
      }} />
    </React.Fragment>
  )
}

//--------------------------------------------------------------------------------
const UserInformation: React.FC<{
  id: string | null,
  profile: {
    fullName: string,
    status: string,
    identifiers: Array<{ identifier: string }>,
    roles: Array<{ name: string }>,
    departments: Array<{ name: string }>,
    positions: Array<{ title: string }>,
    createdAt: string;
    modifiedAt: string;
    [extra: symbol | string]: number | string | Array<object>,
  }
}> = ({ profile, id }) => {
  const notify = useNotify();
  const refresh = useRefresh();

  //--------------------------------------------------------------------------------
  const dataProvider = React.useMemo(() => {
    return LbProviderGetter({ baseUrl: BASE_URL });
  }, []);

  const { status, roles, departments, positions } = React.useMemo(() => {
    return {
      status: get(EMPLOYEES_STATUS.NAME, profile?.status),
      roles: profile?.roles?.map((role: { name: string }) => role.name)?.join(', ') ?? '-',
      departments: profile?.departments?.map(
        (department: { name: string }) => department?.name
      )?.join(', ') ?? '-',
      positions: profile?.positions?.map(
        (position: { title: string }) => position?.title
      )?.join(', ') ?? '-',
    }
  }, [profile])


  //--------------------------------------------------------------------------------
  const data: any = profile?.profile;
  const [identifier, setIdentifier] = useState<string>(profile?.identifiers?.[0]?.identifier ?? '');
  const [fullName, setFullName] = useState<string>(data?.fullName ?? '');
  const [active, setActive] = useState<boolean>(true)
  //--------------------------------------------------------------------------------
  const handleChangeUser = useCallback(() => {
    const user = {identifier, fullName};
    dataProvider.send(
      `${PATH.USERS}/${id}/${PATH.CHANGE_USER}`,
      {
        method: "patch",
        data: user,
      })
      .then((response: any) => {
        if (response?.data?.error) {
          notify(response?.data?.error.message, { type: 'error' })
          refresh();
        } 
        else {
          notify('Update profile successfully!', { type: 'success' })
          refresh();
        }
      })
  },
    [dataProvider, identifier, fullName])

  //--------------------------------------------------------------------------------
  return (<React.Fragment>
    <Grid container item xs={12} md={10} spacing={5}>
      <Grid item xs={10} md={12}>
        <TextField label="Username" value={identifier}
          onChange={(e) => [setIdentifier(e.target.value), setActive(false)]}
          fullWidth />
      </Grid>

      {/* __________________________________________________ ___________*/}
      <Grid item xs={10} md={12}>
        <TextField label="Fullname" value={fullName}
          onChange={(e) => [setFullName(e.target.value), setActive(false)]}
          fullWidth />
      </Grid>

      {/* _______________________________________________ */}
      <Grid item xs={10} md={12}>
        <TextField
          label="Created At:"
          value={`${formatTimeToYMD(data.createdAt ?? "-")}`} fullWidth />
      </Grid>

      <Grid item xs={10} md={12}>
        <TextField
          label="Modified At"
          value={`${formatTimeToYMD(
            data?.modifiedAt ?? "-")}`} fullWidth />
      </Grid>

      <Grid item xs={10} md={12}>
        <TextField
          label="Departments"
          value={departments} fullWidth />
      </Grid>

      <Grid item xs={10} md={12}>
        <TextField
          label="Positions"
          value={positions} fullWidth />
      </Grid>
      <Grid item xs={10} md={12}>
        <TextField
          label="Role"
          value={roles} fullWidth />
      </Grid>
      <Grid item xs={10} md={12}>
        <TextField
          label="Status"
          value={status} fullWidth />
      </Grid>

      <Grid item xs={12}>
        <ButtonGroup fullWidth>
          <ChangePassword />
          <Button color="primary" disabled={active} onClick={handleChangeUser} fullWidth>Update Profile</Button>
        </ButtonGroup>
      </Grid>
    </Grid>
  </React.Fragment>)
}

//--------------------------------------------------------------------------------
export const MyProfile: React.FC<object> = () => {
  const classes = useStyles();
  const id = React.useMemo<string | null>(() => localStorage.getItem("userId"), []);
  const { data: myProfile, isLoading: myProfileLoading } = useGetOne(
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
  //--------------------------------------------------------------------------------
  return (
    <Paper className={classes.root}>
      <Typography className={classes.title} variant="h4">
        My Profile
      </Typography>

      {!myProfileLoading && myProfile && (
        <Grid container spacing={5}>
          <Grid item xs={12} md={4} marginTop={(theme) => theme.spacing(1)}>
            <UserAvatar profile={myProfile?.profile} />
          </Grid>
          <Grid item xs={1} />
          <Grid item xs={12} md={7} marginTop={(theme) => theme.spacing(1)}>
            <UserInformation id={id} profile={myProfile} />
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};
