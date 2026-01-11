Feature: Configuration
  The server should load S3 configuration from environment variables.

  Scenario: Load default configuration
    When I load the S3 configuration
    Then it should include a region
