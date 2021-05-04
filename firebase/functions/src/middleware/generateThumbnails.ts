/*
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// TODO: This is not a middleware
import { UserModel } from "../model/index";

import { Bucket } from "@google-cloud/storage";
import * as admin from "firebase-admin";
import * as fs from "fs";
import { spawn } from "child-process-promise";
import * as os from "os";
import * as path from "path";
import { v4 as uuidv4 } from 'uuid';

import { ObjectMetadata } from "firebase-functions/lib/providers/storage";
import { logger } from '../log';

const log = logger('generateThumbnails');

interface ResizedImageResult {
  size: string;
  downloadUrl: string;
  success: boolean;
}

const config = {
    cacheControlHeader: "max-age=86400",
    imageSizes: ["64x64"],
    resizedImagesPath: "thumbnails",
    deleteOriginalFile: false,
}

const extractFileNameWithoutExtension = (
    filePath: string,
    ext: string
  ) => {
    return path.basename(filePath, ext);
};

/**
 * When an image is uploaded in the Storage bucket We generate a resized image automatically using
 * ImageMagick which is installed by default on all Cloud Functions instances.
 */
export const generateResizedImage = async (object, db): Promise<void> => {
    const { contentType } = object; // This is the image MIME type

    if (!contentType) {
      return;
    }

    const isImage = contentType.startsWith("image/");
    if (!isImage) {
      return;
    }

    if (object.metadata && object.metadata.resizedImage === "true") {
      return;
    }

    if (!object.name.includes('profile-pictures')) {
      return;
    }

    const bucket = admin.storage().bucket(object.bucket);
    const filePath = object.name; // File path in the bucket.
    const fileDir = path.dirname(filePath);
    const fileExtension = path.extname(filePath);
    const fileNameWithoutExtension = extractFileNameWithoutExtension(
      filePath,
      fileExtension
    );
    const objectMetadata = object;

    let originalFile;
    let remoteFile;
    try {
      originalFile = path.join(os.tmpdir(), filePath);
      const tempLocalDir = path.dirname(originalFile);

      // Create the temp directory where the storage file will be downloaded.
      try {
        fs.mkdirSync(tempLocalDir)
      } catch (err) {
        if (err.code !== 'EEXIST') throw err
      }

      // Download file from bucket.
      remoteFile = bucket.file(filePath);
      await remoteFile.download({ destination: originalFile });

      // Convert to a set to remove any duplicate sizes
      const imageSizes = new Set(config.imageSizes);
      const tasks: Promise<ResizedImageResult>[] = [];
      imageSizes.forEach((size) => {
        tasks.push(
          resizeImage({
            bucket,
            originalFile,
            fileDir,
            fileNameWithoutExtension,
            fileExtension,
            contentType,
            size,
            objectMetadata: objectMetadata,
          })
        );
      });

      const results = await Promise.all(tasks);
      try {
        let personId = filePath.match( /([0-9]{5})_/)[1];
        let originalUrl = "https://firebasestorage.googleapis.com/v0/b/" + bucket.name + "/o/" + encodeURIComponent(remoteFile.name) + "?alt=media&token=" + remoteFile.metadata.metadata.firebaseStorageDownloadTokens
        let userModel = new UserModel(db);
        await userModel.updateProfileImageUrl(personId, originalUrl, results[0].downloadUrl);
      } catch (error) {
        return;
      }
      const failed = results.some((result) => result.success === false);
      if (failed) {
        return;
      }
    } catch (err) {
      log.error(err)
    } finally {

      if (originalFile) {
        fs.unlinkSync(originalFile);
      }
      if (config.deleteOriginalFile) {
        // Delete the original file
        if (remoteFile) {
          try {
            await remoteFile.delete();
          } catch (err) {
          }
        }
      }
    }
  }

const resizeImage = async ({
  bucket,
  originalFile,
  fileDir,
  fileNameWithoutExtension,
  fileExtension,
  contentType,
  size,
  objectMetadata,
}: {
  bucket: Bucket;
  originalFile: string;
  fileDir: string;
  fileNameWithoutExtension: string;
  fileExtension: string;
  contentType: string;
  size: string;
  objectMetadata: ObjectMetadata;
}): Promise<ResizedImageResult> => {
  const resizedFileName = `${size}_${fileNameWithoutExtension}${fileExtension}`;
  // Path where resized image will be uploaded to in Storage.
  const resizedFilePath = path.normalize(
    config.resizedImagesPath
      ? path.join(fileDir, config.resizedImagesPath, resizedFileName)
      : path.join(fileDir, resizedFileName)
  );
  let resizedFile;
  let downloadUrl = "";
  try {
    resizedFile = path.join(os.tmpdir(), resizedFileName);

    let uuid = uuidv4();
    // Cloud Storage files.
    const metadata: any = {
      contentDisposition: objectMetadata.contentDisposition,
      contentEncoding: objectMetadata.contentEncoding,
      contentLanguage: objectMetadata.contentLanguage,
      contentType: contentType,
      firebaseStorageDownloadTokens: uuid,
      metadata: objectMetadata.metadata || {},
    };
    metadata.metadata.resizedImage = true;
    if (config.cacheControlHeader) {
      metadata.cacheControl = config.cacheControlHeader;
    } else {
      metadata.cacheControl = objectMetadata.cacheControl;
    }
    delete metadata.metadata.firebaseStorageDownloadTokens;

    // Generate a resized image using ImageMagick.
    await spawn("convert", [originalFile, "-resize", `${size}>`, resizedFile], {
      capture: ["stdout", "stderr"],
    });

    // Uploading the resized image.
    await bucket.upload(resizedFile, {
      destination: resizedFilePath,
      metadata,
    }).then((data) => {
        let file = data[0];
        downloadUrl = "https://firebasestorage.googleapis.com/v0/b/" + bucket.name + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid
    });
    return { size, downloadUrl, success: true };
  } catch (err) {
    return { size, downloadUrl, success: false };
  } finally {
    try {
      // Make sure the local resized file is cleaned up to free up disk space.
      if (resizedFile) {
        fs.unlinkSync(resizedFile);
      }
    } catch (err) {
    }
  }
};
