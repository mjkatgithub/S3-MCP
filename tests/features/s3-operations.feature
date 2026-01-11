Feature: S3 Operations
  The server should be able to interact with S3-compatible storage.

  @integration
  Scenario: List buckets from S3
    When I list S3 buckets
    Then I should receive a bucket list

  @integration
  Scenario: List objects in a bucket
    Given I have a bucket named "first-bucket"
    When I list objects in the bucket
    Then I should receive an object list

  @integration
  Scenario: List objects with prefix
    Given I have a bucket named "first-bucket"
    When I list objects in the bucket with prefix "wqer"
    Then I should receive an object list

  @integration
  Scenario: List objects non-recursive
    Given I have a bucket named "first-bucket"
    When I list objects in the bucket non-recursively
    Then I should receive an object list with common prefixes

  @integration
  Scenario: Get object metadata
    Given I have a bucket named "first-bucket"
    And I have an object with key "IMG_20250106_184912_382.jpg"
    When I get metadata for the object
    Then I should receive object metadata
    And the metadata should include content type
    And the metadata should include content length

  @integration
  Scenario: Search objects by name
    Given I have a bucket named "first-bucket"
    When I search for objects containing "IMG"
    Then I should receive search results
    And the results should contain objects with "IMG" in the name

  @integration
  Scenario: Search objects with prefix
    Given I have a bucket named "first-bucket"
    When I search for objects containing "IMG" with prefix "wqer"
    Then I should receive search results
