import { UploadApiResponse } from "cloudinary";
import cloudinary from "./cloudinary";

export const streamUpload = (
  fileBuffer: Buffer,
  resourceType: "video" | "image" | "auto",
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: "audio_pp",
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      },
    );
    stream.end(fileBuffer);
  });
};
