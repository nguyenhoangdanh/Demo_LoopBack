export type FileRequest = {
  bucket: string;
  buffer: Buffer;
  fileName: string;
  userId?: number;
  description?: string;
};

export type File = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
};

export type FilesObject = {
  [fieldname: string]: File[];
};

export type ImgObject = {
  id: number;
  imgBuffer: Buffer;
};
