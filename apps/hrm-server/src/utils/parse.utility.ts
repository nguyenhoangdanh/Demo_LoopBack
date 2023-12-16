import { Request, Response } from '@loopback/rest';
import multer from 'multer';

export const parseMultipartBody = (request: Request, response: Response) => {
  const storage = multer.memoryStorage();
  const upload = multer({ storage });

  return new Promise<Request>((resolve, reject) => {
    upload.any()(request, response, (err: any) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(request);
    });
  });
};
export const parsePythonArrayString = (strData: string): any => {
  // Replace Python's single quotes with JSON double quotes
  let jsonString = strData.replace(/'/g, '"');

  // Replace Python's array() with JSON []
  jsonString = jsonString.replace(/array\(/g, '');
  jsonString = jsonString.replace(/\)/g, '');

  // Remove extra spaces
  jsonString = jsonString.replace(/\s+/g, '');

  // Now you can parse the JSON string
  let parsedData = JSON.parse(jsonString);

  return parsedData;
};
