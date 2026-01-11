# s3-mcp

MCP server for S3-compatible storage (e.g., MinIO). Provides tools to list buckets,
list objects, retrieve object metadata and tags, and search objects by name.

## Quick start

```bash
npm install
npm run build
node dist/index.js
```

## Environment variables

- `S3_ENDPOINT` (optional): Custom endpoint, e.g. `http://localhost:9000`
- `S3_REGION` (default: `us-east-1`)
- `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` / `S3_SESSION_TOKEN` (optional)
- `S3_FORCE_PATH_STYLE` (default: `true`)
- `S3_TLS` (default: `true`) - set `false` to allow `http`

## Tools

- `s3_list_buckets`
- `s3_list_objects`
- `s3_get_object_metadata`
- `s3_search_objects`

## Required S3 Permissions

The following S3 permissions are required for the MCP server to function
properly:

- `s3:ListAllMyBuckets` - List all buckets
- `s3:ListBucket` - List objects in a bucket
- `s3:GetObject` - Get object metadata (HeadObject)
- `s3:GetObjectTagging` - Get object tags

Example IAM policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListAllMyBuckets",
        "s3:ListBucket"
      ],
      "Resource": ["arn:aws:s3:::*"]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:GetObjectTagging"
      ],
      "Resource": ["arn:aws:s3:::*/*"]
    }
  ]
}
```

## Project

- License: `LICENSE`
- Contributing: `CONTRIBUTING.md`
- Code of Conduct: `CODE_OF_CONDUCT.md`

## Docker

Build the image:

```bash
docker build -t s3-mcp .
```

Run the container (Linux/macOS):

```bash
docker run --rm -i \
  -e S3_ENDPOINT=http://host.docker.internal:9000 \
  -e S3_ACCESS_KEY_ID=minioadmin \
  -e S3_SECRET_ACCESS_KEY=minioadmin \
  -e S3_REGION=us-east-1 \
  -e S3_FORCE_PATH_STYLE=true \
  -e S3_TLS=false \
  s3-mcp
```

Run the container (Windows PowerShell):

```bash
docker run --rm -i ^
  -e S3_ENDPOINT=http://host.docker.internal:9000 ^
  -e S3_ACCESS_KEY_ID=minioadmin ^
  -e S3_SECRET_ACCESS_KEY=minioadmin ^
  -e S3_REGION=us-east-1 ^
  -e S3_FORCE_PATH_STYLE=true ^
  -e S3_TLS=false ^
  s3-mcp
```

## Tests

Run unit tests (without integration tests):

```bash
npm test
```

Run integration tests (require a reachable S3-compatible endpoint):

Integration tests need S3 credentials configured via environment variables.
Copy `.example.env` to `.env` and adjust the values for your S3-compatible
storage:

```bash
cp .example.env .env
# Edit .env with your S3 credentials
```

Then run the integration tests:

```bash
npm run test:integration
```

The `.env` file is git-ignored and will be automatically loaded by the tests.

Integration tests are tagged with `@integration` and test all S3 operations:
- List buckets
- List objects (with/without prefix, recursive/non-recursive)
- Get object metadata
- Search objects by name (with/without prefix)
