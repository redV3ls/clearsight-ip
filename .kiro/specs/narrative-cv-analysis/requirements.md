# Requirements Document

## Introduction

The CV analysis feature should provide users with narrative-based feedback about their resume, focusing on storytelling and career guidance rather than structured data extraction. The current implementation is failing because it's trying to parse narrative responses as structured data, when the narrative format is actually the desired output.

## Requirements

### Requirement 1: Narrative CV Analysis Output

**User Story:** As a job seeker, I want to receive narrative feedback about my CV that tells the story of my career journey, so that I can understand my professional strengths and areas for improvement in a human-readable format.

#### Acceptance Criteria

1. WHEN a user submits a CV for analysis THEN the system SHALL return a narrative analysis in natural language format
2. WHEN the AI service returns narrative text THEN the system SHALL accept and return this text without attempting to parse it as structured data
3. WHEN a CV analysis completes THEN the response SHALL include engaging, story-driven feedback about the user's career progression
4. WHEN the analysis includes job description comparison THEN the narrative SHALL include gap analysis in conversational format

### Requirement 2: Remove Structured Data Parsing

**User Story:** As a system administrator, I want the CV analysis to stop attempting structured data parsing, so that the analysis doesn't fail when AI returns narrative responses.

#### Acceptance Criteria

1. WHEN the AI service returns narrative text THEN the system SHALL NOT attempt to parse it for structured sections like "SKILLS:", "EXPERIENCE:", etc.
2. WHEN JSON parsing fails THEN the system SHALL treat the response as valid narrative content rather than falling back to complex parsing logic
3. WHEN the analysis completes THEN the system SHALL return the narrative directly to the user without transformation

### Requirement 3: Simplified Response Format

**User Story:** As a frontend developer, I want a simple, consistent response format for CV analysis, so that I can easily display the narrative feedback to users.

#### Acceptance Criteria

1. WHEN a CV analysis completes successfully THEN the response SHALL include a "narrative" field containing the full analysis text
2. WHEN the response is returned THEN it SHALL maintain the original formatting and structure of the AI-generated narrative
3. WHEN the analysis includes multiple sections THEN they SHALL be preserved as part of the narrative flow rather than parsed into separate fields

### Requirement 4: Maintain Analysis Metadata

**User Story:** As a user, I want to know basic information about my analysis (ID, timestamp, status), so that I can track and reference my analysis results.

#### Acceptance Criteria

1. WHEN an analysis completes THEN the response SHALL include analysis_id, user_id, timestamp, and status fields
2. WHEN the analysis is narrative-based THEN the response SHALL indicate this with an appropriate flag or field
3. WHEN the analysis includes AI-powered content THEN this SHALL be indicated in the response metadata

### Requirement 5: Preserve Job Description Integration

**User Story:** As a job seeker, I want my CV analysis to include comparison with job descriptions when provided, so that I can understand how well I match specific opportunities.

#### Acceptance Criteria

1. WHEN a job description is provided with the CV THEN the narrative analysis SHALL include gap analysis and matching insights
2. WHEN no job description is provided THEN the analysis SHALL focus on standalone CV assessment
3. WHEN job comparison is included THEN it SHALL be woven into the narrative rather than presented as structured data