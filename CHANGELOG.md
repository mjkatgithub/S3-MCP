# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-01-11

### Added

- Initial MCP server for S3-compatible storage (MinIO, AWS S3, etc.).
- Four S3 tools:
  - `s3_list_buckets` - List all S3 buckets
  - `s3_list_objects` - List objects in a bucket (with prefix, recursive options)
  - `s3_get_object_metadata` - Get object metadata and tags
  - `s3_search_objects` - Search objects by name (substring match)
- Environment variable configuration support (with `.env` file for tests).
- Docker build configuration with multi-stage build.
- Comprehensive Cucumber test suite:
  - Unit tests for configuration
  - Integration tests for all S3 operations (7 scenarios)
  - Test setup with dotenv support
- Complete documentation:
  - README with setup instructions and examples
  - Required S3 permissions documented
  - Docker examples for Windows and Linux/macOS
  - Example environment file (`.example.env`)