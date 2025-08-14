# Implementation Plan

- [x] 1. Simplify DeepSeek AI Service for Narrative Output



  - Remove complex parsing logic from `parseSkillsAnalysisResponse()` method
  - Create new `processNarrativeResponse()` method that accepts text directly
  - Update `createSkillsExtractionPrompt()` to focus purely on narrative output
  - Remove `parseNaturalLanguageSkillsResponse()` and related complex parsing methods
  - _Requirements: 1.1, 1.2, 2.1, 2.2_

- [x] 2. Create New Narrative Response Interface



  - Define `NarrativeAnalysis` interface with narrative, analysisType, wordCount fields
  - Remove dependency on complex `AISkillsAnalysis` interface for CV analysis
  - Create utility functions for word counting and response metadata
  - _Requirements: 3.1, 3.2, 4.1_

- [x] 3. Update Analysis Route Handler



  - Modify `/analyze/resume` endpoint to return narrative format
  - Update response structure to include narrative field instead of structured data
  - Ensure analysis metadata (ID, timestamp, status) is preserved
  - Remove structured data transformation logic
  - _Requirements: 1.1, 3.1, 4.1, 4.2_

- [x] 4. Optimize Database Schema for D1


  - Create migration to add `narrative_analysis` table with D1-optimized schema
  - Update data types for D1 compatibility (TEXT for UUIDs, INTEGER for booleans)
  - Implement database operations for storing and retrieving narrative analyses
  - _Requirements: 4.1, 4.3_

- [x] 5. Implement Narrative Storage and Retrieval


  - Create database service methods for narrative analysis CRUD operations
  - Update analysis status checking to work with narrative format
  - Implement efficient querying for user analysis history
  - _Requirements: 4.1, 4.2_

- [x] 6. Update KV Caching for Cloudflare Free Plan


  - Implement cache operations that respect 100K operations/day limit
  - Create cache key strategy for narrative analyses
  - Add manual cleanup logic for old cached analyses (no TTL on free plan)
  - Optimize cache usage to store only completed analyses
  - _Requirements: 4.1_

- [x] 7. Simplify Prompt Engineering



  - Rewrite DeepSeek prompts to request only narrative output
  - Remove instructions for structured sections (SKILLS:, EXPERIENCE:, etc.)
  - Optimize prompts for storytelling and career guidance focus
  - Test prompts to ensure consistent narrative responses
  - _Requirements: 1.1, 1.3, 5.1, 5.2_

- [x] 8. Update Analysis Status and Error Handling


  - Remove parsing-related error handling and timeout logic
  - Simplify error cases to focus on API failures and network issues
  - Update analysis completion logic to handle narrative responses
  - Ensure proper status transitions for narrative analyses
  - _Requirements: 2.2, 4.2_

- [x] 9. Create Job Description Integration for Narrative


  - Update job comparison logic to work with narrative output
  - Ensure job description analysis produces narrative gap analysis
  - Maintain job description integration while keeping narrative format
  - Test both standalone and job-comparison analysis types
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 10. Implement Response Format Consistency



  - Ensure all analysis endpoints return consistent narrative format
  - Update response serialization to handle narrative content properly
  - Preserve original AI formatting and structure in narrative field
  - Add response validation for narrative format
  - _Requirements: 3.1, 3.2_

- [x] 11. Add Comprehensive Testing for Narrative Flow




  - Write unit tests for narrative processing methods
  - Create integration tests for end-to-end narrative analysis
  - Test both standalone and job-comparison scenarios
  - Add performance tests to verify improved processing times
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 12. Update Analysis History and Retrieval
  - Modify analysis history endpoints to return narrative format
  - Ensure backward compatibility with existing analysis data
  - Update analysis retrieval by ID to handle narrative responses
  - Test analysis history pagination and filtering
  - _Requirements: 4.1, 4.2_

- [ ] 13. Optimize for Cloudflare Free Plan Limits
  - Review and optimize D1 database operations to stay within limits
  - Implement efficient KV storage usage patterns
  - Add monitoring for resource usage against free plan quotas
  - Optimize Worker CPU and memory usage with simplified processing
  - _Requirements: 2.1, 2.2_

- [ ] 14. Create Migration Strategy for Existing Data
  - Implement database migration scripts for new narrative schema
  - Create data migration utilities if needed for existing analyses
  - Ensure smooth transition from structured to narrative format
  - Test migration process in development environment
  - _Requirements: 4.1_

- [ ] 15. Final Integration Testing and Validation
  - Perform end-to-end testing of complete narrative analysis flow
  - Validate that analysis no longer times out due to parsing issues
  - Test with various CV formats and lengths
  - Verify job description integration works with narrative output
  - Confirm all analysis metadata is properly maintained
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 3.1, 4.1, 5.1, 5.2, 5.3_