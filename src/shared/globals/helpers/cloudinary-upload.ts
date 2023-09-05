import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

export function upload(
  file: string,
  public_id?: string,
  overwrite?: boolean,
  invalidate?: boolean
): Promise<UploadApiErrorResponse | UploadApiResponse | undefined> {
  return new Promise((resolve) => {
    cloudinary.uploader
      .upload(
        file,
        {
          public_id,
          overwrite,
          invalidate
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) resolve(error);
          resolve(result);
        }
      )
      .then((result) => console.log(result));
  });
}
