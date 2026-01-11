import { Given, Then, When } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import { loadConfig } from "../../src/config.js";
import {
  getObjectMetadata,
  listBuckets,
  listObjects,
  searchObjectsByName
} from "../../src/s3.js";
import type { TestWorldState } from "./world.js";

When("I load the S3 configuration", function (this: TestWorldState) {
  this.config = loadConfig();
});

Then("it should include a region", function (this: TestWorldState) {
  assert.ok(this.config?.region);
});

When("I list S3 buckets", async function (this: TestWorldState) {
  this.buckets = await listBuckets();
});

Then("I should receive a bucket list", function (this: TestWorldState) {
  assert.ok(Array.isArray(this.buckets));
});

Given("I have a bucket named {string}", function (this: TestWorldState, bucket: string) {
  this.bucket = bucket;
});

Given("I have an object with key {string}", function (this: TestWorldState, key: string) {
  this.objectKey = key;
});

When("I list objects in the bucket", async function (this: TestWorldState) {
  if (!this.bucket) {
    throw new Error("Bucket not set");
  }
  this.objectsResult = await listObjects(this.bucket, undefined, true);
});

When("I list objects in the bucket with prefix {string}", async function (
  this: TestWorldState,
  prefix: string
) {
  if (!this.bucket) {
    throw new Error("Bucket not set");
  }
  this.objectsResult = await listObjects(this.bucket, prefix, true);
});

When("I list objects in the bucket non-recursively", async function (this: TestWorldState) {
  if (!this.bucket) {
    throw new Error("Bucket not set");
  }
  this.objectsResult = await listObjects(this.bucket, undefined, false);
});

Then("I should receive an object list", function (this: TestWorldState) {
  assert.ok(this.objectsResult);
  assert.ok(Array.isArray(this.objectsResult.objects));
});

Then("I should receive an object list with common prefixes", function (this: TestWorldState) {
  assert.ok(this.objectsResult);
  assert.ok(Array.isArray(this.objectsResult.commonPrefixes));
});

When("I get metadata for the object", async function (this: TestWorldState) {
  if (!this.bucket || !this.objectKey) {
    throw new Error("Bucket or object key not set");
  }
  this.objectMetadata = await getObjectMetadata(this.bucket, this.objectKey);
});

Then("I should receive object metadata", function (this: TestWorldState) {
  assert.ok(this.objectMetadata);
  assert.strictEqual(this.objectMetadata.bucket, this.bucket);
  assert.strictEqual(this.objectMetadata.key, this.objectKey);
});

Then("the metadata should include content type", function (this: TestWorldState) {
  assert.ok(this.objectMetadata?.contentType);
});

Then("the metadata should include content length", function (this: TestWorldState) {
  assert.ok(typeof this.objectMetadata?.contentLength === "number");
});

When("I search for objects containing {string}", async function (
  this: TestWorldState,
  nameContains: string
) {
  if (!this.bucket) {
    throw new Error("Bucket not set");
  }
  this.searchName = nameContains;
  this.searchResults = await searchObjectsByName(this.bucket, nameContains);
});

When("I search for objects containing {string} with prefix {string}", async function (
  this: TestWorldState,
  nameContains: string,
  prefix: string
) {
  if (!this.bucket) {
    throw new Error("Bucket not set");
  }
  this.searchName = nameContains;
  this.searchPrefix = prefix;
  this.searchResults = await searchObjectsByName(this.bucket, nameContains, prefix);
});

Then("I should receive search results", function (this: TestWorldState) {
  assert.ok(Array.isArray(this.searchResults));
});

Then("the results should contain objects with {string} in the name", function (
  this: TestWorldState,
  expected: string
) {
  assert.ok(this.searchResults && this.searchResults.length > 0);
  const lowerExpected = expected.toLowerCase();
  for (const result of this.searchResults) {
    assert.ok(result.key.toLowerCase().includes(lowerExpected));
  }
});
