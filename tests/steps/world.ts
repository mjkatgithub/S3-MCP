import { setWorldConstructor } from "@cucumber/cucumber";
import type { S3Config } from "../../src/config.js";
import type {
  ListObjectsResult,
  ObjectMetadata,
  ObjectSummary
} from "../../src/s3.js";

export type TestWorldState = {
  config?: S3Config;
  buckets?: string[];
  bucket?: string;
  objectKey?: string;
  objectsResult?: ListObjectsResult;
  objectMetadata?: ObjectMetadata;
  searchResults?: ObjectSummary[];
  searchPrefix?: string;
  searchName?: string;
};

class TestWorld implements TestWorldState {
  config?: S3Config;
  buckets?: string[];
  bucket?: string;
  objectKey?: string;
  objectsResult?: ListObjectsResult;
  objectMetadata?: ObjectMetadata;
  searchResults?: ObjectSummary[];
  searchPrefix?: string;
  searchName?: string;
}

setWorldConstructor(TestWorld);
