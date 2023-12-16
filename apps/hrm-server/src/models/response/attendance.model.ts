export type AttendanceRes = {
  id?: number;
  userId?: number;
  fullname: string;
  checkInTime: string;
  address: string;
  imgFace: Buffer;
  coordinates: {
    lat: number;
    lng: number;
  };
};

export type AttendanceSync = {
  id: number;
  userId: number;
  fullname: string;
  checkInTime: string;
  checkOutTime: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  databaseId: string;
};
