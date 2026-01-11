import {
  GetObjectTaggingCommand,
  HeadObjectCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  S3Client,
  type ListObjectsV2CommandOutput,
  type Tag
} from "@aws-sdk/client-s3";
import { loadConfig } from "./config.js";

export type ObjectSummary = {
  key: string;
  size?: number;
  lastModified?: string;
  eTag?: string;
  storageClass?: string;
};

export type ListObjectsResult = {
  bucket: string;
  prefix?: string;
  recursive: boolean;
  objects: ObjectSummary[];
  commonPrefixes: string[];
};

export type ObjectMetadata = {
  bucket: string;
  key: string;
  contentType?: string;
  contentLength?: number;
  lastModified?: string;
  eTag?: string;
  metadata: Record<string, string>;
  tags: Record<string, string>;
};

const createClient = (): S3Client => {
  const config = loadConfig();
  let endpoint = config.endpoint;
  
  if (endpoint) {
    // If protocol is explicitly specified, respect it
    const hasProtocol = /^https?:\/\//i.test(endpoint);
    
    if (hasProtocol) {
      // If TLS is disabled and endpoint uses https, change to http
      if (!config.tls && /^https:\/\//i.test(endpoint)) {
        endpoint = endpoint.replace(/^https:\/\//i, "http://");
      }
    } else {
      // If no protocol specified, add it based on TLS setting
      endpoint = config.tls ? `https://${endpoint}` : `http://${endpoint}`;
    }
  }

  const credentials =
    config.accessKeyId && config.secretAccessKey
      ? {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
          sessionToken: config.sessionToken
        }
      : undefined;

  return new S3Client({
    region: config.region,
    endpoint,
    credentials,
    forcePathStyle: config.forcePathStyle
  });
};

const client = createClient();

const tagsToMap = (tags: Tag[] | undefined): Record<string, string> => {
  const result: Record<string, string> = {};
  if (!tags) {
    return result;
  }
  for (const tag of tags) {
    if (tag.Key) {
      result[tag.Key] = tag.Value ?? "";
    }
  }
  return result;
};

export const listBuckets = async (): Promise<string[]> => {
  try {
    const response = await client.send(new ListBucketsCommand({}));
    return (response.Buckets ?? []).map((bucket) => bucket.Name ?? "").filter(Boolean);
  } catch (error) {
    let message = "";
    if (error instanceof Error) {
      message = error.message || error.name || String(error);
      // Include additional error details if available
      if ((error as any).$metadata) {
        const metadata = (error as any).$metadata;
        message += ` (HTTP ${metadata.httpStatusCode || "?"})`;
      }
    } else {
      message = String(error);
    }
    throw new Error(`Failed to list buckets: ${message || "Unknown error"}`);
  }
};

export const listObjects = async (
  bucket: string,
  prefix: string | undefined,
  recursive: boolean,
  maxResults?: number
): Promise<ListObjectsResult> => {
  const objects: ObjectSummary[] = [];
  const commonPrefixes: string[] = [];
  let continuationToken: string | undefined = undefined;

  do {
    const response: ListObjectsV2CommandOutput = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
        Delimiter: recursive ? undefined : "/"
      })
    );

    for (const item of response.Contents ?? []) {
      if (!item.Key) {
        continue;
      }
      objects.push({
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified?.toISOString(),
        eTag: item.ETag,
        storageClass: item.StorageClass
      });
      if (maxResults && objects.length >= maxResults) {
        break;
      }
    }

    for (const prefixEntry of response.CommonPrefixes ?? []) {
      if (prefixEntry.Prefix) {
        commonPrefixes.push(prefixEntry.Prefix);
      }
    }

    if (maxResults && objects.length >= maxResults) {
      break;
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return {
    bucket,
    prefix,
    recursive,
    objects,
    commonPrefixes
  };
};

export const getObjectMetadata = async (bucket: string, key: string): Promise<ObjectMetadata> => {
  const head = await client.send(
    new HeadObjectCommand({
      Bucket: bucket,
      Key: key
    })
  );

  const tagging = await client.send(
    new GetObjectTaggingCommand({
      Bucket: bucket,
      Key: key
    })
  );

  return {
    bucket,
    key,
    contentType: head.ContentType,
    contentLength: head.ContentLength,
    lastModified: head.LastModified?.toISOString(),
    eTag: head.ETag,
    metadata: head.Metadata ?? {},
    tags: tagsToMap(tagging.TagSet)
  };
};

export const searchObjectsByName = async (
  bucket: string,
  nameContains: string,
  prefix?: string,
  maxResults?: number
): Promise<ObjectSummary[]> => {
  const lowered = nameContains.toLowerCase();
  const matches: ObjectSummary[] = [];
  let continuationToken: string | undefined = undefined;

  do {
    const response: ListObjectsV2CommandOutput = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken
      })
    );

    for (const item of response.Contents ?? []) {
      if (!item.Key) {
        continue;
      }
      if (item.Key.toLowerCase().includes(lowered)) {
        matches.push({
          key: item.Key,
          size: item.Size,
          lastModified: item.LastModified?.toISOString(),
          eTag: item.ETag,
          storageClass: item.StorageClass
        });
      }
      if (maxResults && matches.length >= maxResults) {
        break;
      }
    }

    if (maxResults && matches.length >= maxResults) {
      break;
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return matches;
};
