import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import { useTheme } from "@mui/material";
import "./style.css";

const pin = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png";

export const GeoMap = (opts: any) => {
  const { latitude, longitude, addressMap } = opts ?? {};
  const theme = useTheme();

  const center: any = [latitude, longitude];
  const position: any = [latitude, longitude];

  const pinMB = L.icon({
    iconUrl: pin,
    iconSize: [24, 41],
    iconAnchor: [0, 44],
    popupAnchor: [12, -40],
  });

  return (
    <MapContainer
      center={center}
      zoom={15}
      minZoom={11}
      maxZoom={18}
      dragging={true}
      keyboard={false}
      scrollWheelZoom={true}
      attributionControl={false}
      style={{ marginLeft: theme.spacing(3) }}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} icon={pinMB}>
        <Tooltip sticky>{addressMap}</Tooltip>
      </Marker>
    </MapContainer>
  );
};
