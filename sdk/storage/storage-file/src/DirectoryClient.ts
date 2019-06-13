// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { Aborter } from "./Aborter";
import * as Models from "./generated/lib/models";
import { Directory } from "./generated/lib/operations";
import { Metadata } from "./models";
import { Pipeline } from "./Pipeline";
import { StorageClient } from "./StorageClient";
import { appendToURLPath } from "./utils/utils.common";
import { FileClient, FileCreateOptions, FileDeleteOptions } from "./FileClient";

/**
 * Options to configure Directory - Create operation.
 *
 * @export
 * @interface DirectoryCreateOptions
 */
export interface DirectoryCreateOptions {
  /**
   * Aborter instance to cancel request. It can be created with Aborter.none
   * or Aborter.timeout(). Go to documents of {@link Aborter} for more examples
   * about request cancellation.
   *
   * @type {Aborter}
   * @memberof AppendBlobCreateOptions
   */
  abortSignal?: Aborter;
  /**
   * A collection of key-value string pair to associate with the file storage object.
   *
   * @type {Metadata}
   * @memberof DirectoryCreateOptions
   */
  metadata?: Metadata;
}

/**
 * Options to configure Directory - List Files and Directories Segment operation.
 *
 * @export
 * @interface DirectoryListFilesAndDirectoriesSegmentOptions
 */
export interface DirectoryListFilesAndDirectoriesSegmentOptions {
  /**
   * Aborter instance to cancel request. It can be created with Aborter.none
   * or Aborter.timeout(). Go to documents of {@link Aborter} for more examples
   * about request cancellation.
   *
   * @type {Aborter}
   * @memberof AppendBlobCreateOptions
   */
  abortSignal?: Aborter;
  /**
   * Filters the results to return only entries whose
   * name begins with the specified prefix.
   *
   * @type {string}
   * @memberof DirectoryListFilesAndDirectoriesSegmentOptions
   */
  prefix?: string;

  /**
   * Specifies the maximum number of entries to
   * return. If the request does not specify maxresults, or specifies a value
   * greater than 5,000, the server will return up to 5,000 items.
   *
   * @type {number}
   * @memberof DirectoryListFilesAndDirectoriesSegmentOptions
   */
  maxresults?: number;
}

/**
 * Options to configure Directory - Delete operation.
 *
 * @export
 * @interface DirectoryDeleteOptions
 */
export interface DirectoryDeleteOptions {
  /**
   * Aborter instance to cancel request. It can be created with Aborter.none
   * or Aborter.timeout(). Go to documents of {@link Aborter} for more examples
   * about request cancellation.
   *
   * @type {Aborter}
   * @memberof AppendBlobCreateOptions
   */
  abortSignal?: Aborter;
}

/**
 * Options to configure Directory - Get Properties operation.
 *
 * @export
 * @interface DirectoryGetPropertiesOptions
 */
export interface DirectoryGetPropertiesOptions {
  /**
   * Aborter instance to cancel request. It can be created with Aborter.none
   * or Aborter.timeout(). Go to documents of {@link Aborter} for more examples
   * about request cancellation.
   *
   * @type {Aborter}
   * @memberof AppendBlobCreateOptions
   */
  abortSignal?: Aborter;
}

/**
 * Options to configure Directory - Set Metadata operation.
 *
 * @export
 * @interface DirectorySetMetadataOptions
 */
export interface DirectorySetMetadataOptions {
  /**
   * Aborter instance to cancel request. It can be created with Aborter.none
   * or Aborter.timeout(). Go to documents of {@link Aborter} for more examples
   * about request cancellation.
   *
   * @type {Aborter}
   * @memberof AppendBlobCreateOptions
   */
  abortSignal?: Aborter;
}

/**
 * A DirectoryClient represents a URL to the Azure Storage directory allowing you to manipulate its files and directories.
 *
 * @export
 * @class DirectoryClient
 */
export class DirectoryClient extends StorageClient {
  /**
   * context provided by protocol layer.
   *
   * @private
   * @type {Directory}
   * @memberof DirectoryClient
   */
  private context: Directory;

  /**
   * Creates an instance of DirectoryClient.
   *
   * @param {string} url A URL string pointing to Azure Storage file directory, such as
   *                     "https://myaccount.file.core.windows.net/myshare/mydirectory". You can
   *                     append a SAS if using AnonymousCredential, such as
   *                     "https://myaccount.file.core.windows.net/myshare/mydirectory?sasString".
   *                     This method accepts an encoded URL or non-encoded URL pointing to a directory.
   *                     Encoded URL string will NOT be escaped twice, only special characters in URL path will be escaped.
   *                     However, if a directory name includes %, directory name must be encoded in the URL.
   *                     Such as a directory named "mydir%", the URL should be "https://myaccount.file.core.windows.net/myshare/mydir%25".
   * @param {Pipeline} pipeline Call newPipeline() to create a default
   *                            pipeline, or provide a customized pipeline.
   * @memberof DirectoryClient
   */
  constructor(url: string, pipeline: Pipeline) {
    super(url, pipeline);
    this.context = new Directory(this.storageClientContext);
  }

  /**
   * Creates a new directory under the specified share or parent directory.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/create-directory
   *
   * @param {DirectoryCreateOptions} [options] Options to Directory Create operation.
   * @returns {Promise<Models.DirectoryCreateResponse>} Response data for the Directory  operation.
   * @memberof DirectoryClient
   */
  public async create(
    options: DirectoryCreateOptions = {}
  ): Promise<Models.DirectoryCreateResponse> {
    const aborter = options.abortSignal || Aborter.none;
    return this.context.create({
      ...options,
      abortSignal: aborter
    });
  }

  /**
   * Creates a DirectoryClient object for a sub directory.
   *
   * @param subDirectoryName A subdirectory name
   * @returns {DirectoryClient} The DirectoryClient object for the given sub directory name.
   * @memberof DirectoryClient
   */
  public createDirectoryClient(subDirectoryName: string): DirectoryClient {
    return new DirectoryClient(
      appendToURLPath(this.url, encodeURIComponent(subDirectoryName)),
      this.pipeline
    );
  }

  /**
   * Creates a new subdirectory under this directory.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/create-directory
   *
   *
   * @param {string} directoryName
   * @param {DirectoryCreateOptions} [options] Options to Directory Create operation.
   * @returns Directory creation response data and the corresponding directory client.
   * @memberof DirectoryClient
   */
  public async createSubdirectory(directoryName: string, options?: DirectoryCreateOptions) {
    const directoryClient = this.createDirectoryClient(directoryName);
    const directoryCreateResponse = await directoryClient.create(options);
    return {
      directoryClient,
      directoryCreateResponse
    };
  }

  /**
   * Removes the specified empty sub directory under this directory.
   * Note that the directory must be empty before it can be deleted.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/delete-directory
   *
   * @param {string} directoryName
   * @param {DirectoryDeleteOptions} [options] Options to Directory Delete operation.
   * @returns Directory deletion response data.
   * @memberof DirectoryClient
   */
  public async deleteSubdirectory(directoryName: string, options?: DirectoryDeleteOptions) {
    const directoryClient = this.createDirectoryClient(directoryName);
    return await directoryClient.delete(options);
  }

  /**
   * Creates a new file or replaces a file under this directory. Note it only initializes the file with no content.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/create-file
   *
   * @param {string} fileName
   * @param {number} size Specifies the maximum size in bytes for the file, up to 1 TB.
   * @param {FileCreateOptions} [options] Options to File Create operation.
   * @returns File creation response data and the corresponding file client.
   * @memberof DirectoryClient
   */
  public async createFile(fileName: string, size: number, options?: FileCreateOptions) {
    const fileClient = this.createFileClient(fileName);
    const fileCreateResponse = await fileClient.create(size, options);
    return {
      fileClient,
      fileCreateResponse
    };
  }

  /**
   * Removes the specified file under this directory from the storage account.
   * When a file is successfully deleted, it is immediately removed from the storage
   * account's index and is no longer accessible to clients. The file's data is later
   * removed from the service during garbage collection.
   *
   * Delete File will fail with status code 409 (Conflict) and error code SharingViolation
   * if the file is open on an SMB client.
   *
   * Delete File is not supported on a share snapshot, which is a read-only copy of
   * a share. An attempt to perform this operation on a share snapshot will fail with 400 (InvalidQueryParameterValue)
   *
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/delete-file2
   *
   * @param {string} fileName Name of the file to delete
   * @param {FileDeleteOptions} [options] Options to File Delete operation.
   * @returns File deletion response data.
   * @memberof DirectoryClient
   */
  public async deleteFile(fileName: string, options?: FileDeleteOptions) {
    const fileClient = this.createFileClient(fileName);
    return await fileClient.delete(options);
  }

  /**
   * Creates a FileClient object.
   *
   * @param {string} fileName A file name
   * @returns
   * @memberof FileClient
   */
  public createFileClient(fileName: string) {
    return new FileClient(appendToURLPath(this.url, encodeURIComponent(fileName)), this.pipeline);
  }

  /**
   * Returns all system properties for the specified directory, and can also be used to check the
   * existence of a directory. The data returned does not include the files in the directory or any
   * subdirectories.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/get-directory-properties
   *
   * @param {DirectoryGetPropertiesOptions} [options] Options to Directory Get Properties operation.
   * @returns {Promise<Models.DirectoryGetPropertiesResponse>} Response data for the Directory Get Properties operation.
   * @memberof DirectoryClient
   */
  public async getProperties(
    options: DirectoryGetPropertiesOptions = {}
  ): Promise<Models.DirectoryGetPropertiesResponse> {
    const aborter = options.abortSignal || Aborter.none;
    return this.context.getProperties({
      abortSignal: aborter
    });
  }

  /**
   * Removes the specified empty directory. Note that the directory must be empty before it can be
   * deleted.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/delete-directory
   *
   * @param {DirectoryDeleteOptions} [options] Options to Directory Delete operation.
   * @returns {Promise<Models.DirectoryDeleteResponse>} Response data for the Directory Delete operation.
   * @memberof DirectoryClient
   */
  public async delete(
    options: DirectoryDeleteOptions = {}
  ): Promise<Models.DirectoryDeleteResponse> {
    const aborter = options.abortSignal || Aborter.none;
    return this.context.deleteMethod({
      abortSignal: aborter
    });
  }

  /**
   * Updates user defined metadata for the specified directory.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/set-directory-metadata
   *
   * @param {Metadata} [metadata] If no metadata provided, all existing directory metadata will be removed
   * @param {DirectorySetMetadataOptions} [options] Options to Directory Set Metadata operation.
   * @returns {Promise<Models.DirectorySetMetadataResponse>} Response data for the Directory Set Metadata operation.
   * @memberof DirectoryClient
   */
  public async setMetadata(
    metadata?: Metadata,
    options: DirectorySetMetadataOptions = {}
  ): Promise<Models.DirectorySetMetadataResponse> {
    const aborter = options.abortSignal || Aborter.none;
    return this.context.setMetadata({
      abortSignal: aborter,
      metadata
    });
  }

  /**
   * Returns a list of files or directories under the specified share or directory. It lists the
   * contents only for a single level of the directory hierarchy.
   * @see https://docs.microsoft.com/en-us/rest/api/storageservices/list-directories-and-files
   *
   * @param {string} [marker] A string value that identifies the portion of the list to be returned with the next list operation.
   * @param {DirectoryListFilesAndDirectoriesSegmentOptions} [options] Options to Directory List Files and Directories Segment operation.
   * @returns {Promise<Models.DirectoryListFilesAndDirectoriesSegmentResponse>} Response data for the Directory List Files and Directories operation.
   * @memberof DirectoryClient
   */
  public async listFilesAndDirectoriesSegment(
    marker?: string,
    options: DirectoryListFilesAndDirectoriesSegmentOptions = {}
  ): Promise<Models.DirectoryListFilesAndDirectoriesSegmentResponse> {
    const aborter = options.abortSignal || Aborter.none;
    return this.context.listFilesAndDirectoriesSegment({
      abortSignal: aborter,
      marker,
      ...options
    });
  }
}
