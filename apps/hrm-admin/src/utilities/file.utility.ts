import Compressor from "compressorjs";

export const base64ToBlob = (base64: string, type: string) => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; ++i) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new Blob([bytes], { type });
};
export const convertBase64ToFile = (base64: string, fileName: string) => {
  const type = base64.split(";")[0].split(":")[1];
  const base64Sliced = base64.replace("data:image/jpeg;base64,", "");
  const blob = base64ToBlob(base64Sliced, type);
  return new File([blob], fileName, { type });
};

export const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.8,
      success: (result) => {
        resolve(new File([result], "jpeg"));
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};
