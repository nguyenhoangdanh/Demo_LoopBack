import { Box, CardMedia } from "@mui/material";
import { BASE_URL, IUserProfile } from "@/common";
import AvatarIcon from "@/assets/image/avatar-modification.svg";

interface ImageAvatarProps {
  src: string | null;
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
        sx={{ width: "1rem", height: "1rem", borderRadius: "50%" }}
        alt={alt}
        {...imgSource}
      />
    </Box>
  );
};

export default function Author(author?: IUserProfile) {
  return author ? (
    <Box
      title={author?.fullName}
      style={{
        cursor: "pointer",
        position: "relative",
      }}
    >
      <ImageAvatar src={author?.faceImgUrl} alt="Avatar" />
    </Box>
  ) : (
    <></>
  );
}
