# Design Document

## Overview

This design transforms the CV analysis system from a structured data extraction approach to a narrative-focused system that leverages DeepSeek AI's natural storytelling capabilities. The key insight is that DeepSeek already provides excellent narrative analysis - we just need to stop trying to parse it as structured data.

## Architecture

### Current Problem Flow
```
CV Input → DeepSeek AI → Narrative Response → Complex Parsing (FAILS) → Timeout
```

### New Simplified Flow
```
CV Input → DeepSeek AI → Narrative Response → Direct Return → Success
```

### Core Components

1. **DeepSeek AI Service** - Simplified to focus on narrative prompts
2. **Response Handler** - Streamlined to accept narrative directly
3. **Analysis Controller** - Updated to return narrative format
4. **Storage Layer** - Modified to store narrative results

## Components and Interfaces

### 1. DeepSeek AI Service Modifications

**Current Interface:**
```typescript
interface AISkillsAnalysis {
  skills: AISkill[];
  categories: string[];
  overallExperience: string;
  // ... complex structured fields
}
```

**New Simplified Interface:**
```typescript
interface NarrativeAnalysis {
  narrative: string;
  analysisType: 'standalone' | 'job-comparison';
  wordCount: number;
  generatedAt: string;
}
```

**Key Changes:**
- Remove `parseSkillsAnalysisResponse()` complexity
- Remove `parseNaturalLanguageSkillsResponse()` fallback logic
- Simplify prompt to focus purely on narrative output
- Accept DeepSeek response directly as narrative content

### 2. Analysis Response Format

**Current Complex Response:**
```json
{
  "analysis_id": "uuid",
  "skills": [...],
  "categories": [...],
  "experience": "...",
  "education": [...],
  // ... many structured fields
}
```

**New Narrative Response:**
```json
{
  "analysis_id": "uuid",
  "user_id": "uuid",
  "status": "completed",
  "narrative": "John Doe has built a strong foundation as a Software Engineer...",
  "analysis_type": "standalone",
  "metadata": {
    "word_count": 450,
    "ai_powered": true,
    "has_job_description": false,
    "processing_time_ms": 2500
  },
  "timestamp": "2025-08-13T19:30:00.000Z"
}
```

### 3. Prompt Optimization

**Current Prompt Issues:**
- Requests both narrative AND structured data
- Complex instructions that confuse the AI
- Parsing expectations that don't match AI output

**New Narrative-Focused Prompt:**
```
You are a senior career coach providing personalized feedback on a professional's resume. 
Write a comprehensive, engaging analysis that tells their career story.

Your analysis should:
1. Describe their professional journey and career progression
2. Highlight unique strengths and standout qualities  
3. Identify areas for growth with specific guidance
4. Provide encouraging but honest assessment
5. Include actionable next steps for career advancement

[If job description provided:]
6. Compare their background to the target role
7. Explain fit and identify any gaps
8. Suggest strategies to strengthen their candidacy

Write in a warm, professional tone as if speaking directly to the candidate.
Focus on storytelling and career guidance rather than technical lists.
```

## Data Models

### 1. Analysis Storage

**Current Complex Schema (D1 Database):**
```sql
CREATE TABLE analysis_results (
  id UUID PRIMARY KEY,
  user_id UUID,
  skills JSONB,
  categories JSONB,
  experience TEXT,
  education JSONB,
  -- ... many structured columns
);
```

**New Simplified Schema (D1 Free Plan Optimized):**
```sql
CREATE TABLE narrative_analysis (
  id TEXT PRIMARY KEY, -- D1 works better with TEXT for UUIDs
  user_id TEXT NOT NULL,
  narrative TEXT NOT NULL,
  analysis_type TEXT NOT NULL, -- 'standalone' | 'job-comparison'
  word_count INTEGER,
  has_job_description INTEGER DEFAULT 0, -- D1 uses INTEGER for boolean
  processing_time_ms INTEGER,
  created_at TEXT DEFAULT (datetime('now')), -- D1 datetime format
  updated_at TEXT DEFAULT (datetime('now'))
);
```

**D1 Free Plan Considerations:**
- 5GB database size limit (sufficient for narrative storage)
- 25 million row reads per day
- 100,000 row writes per day
- SQLite-based, so optimize queries accordingly

### 2. Response Caching (Cloudflare Free Plan Considerations)

**KV Storage Limitations:**
- Free plan: 100,000 read/write operations per day
- 1GB storage limit
- No TTL on free plan (manual cleanup needed)

**Optimized Cache Strategy:**
- Key: `narrative:{user_id}:{hash}`
- Store only completed analyses (not processing states)
- Implement manual cleanup for old analyses
- Consider cache size limits for narrative text

## Error Handling

### 1. Simplified Error Cases

**Remove Complex Parsing Errors:**
- No more JSON parsing failures
- No more structured data validation errors
- No more fallback parsing logic errors

**Focus on Core Errors:**
- DeepSeek API failures
- Network timeouts
- Authentication issues
- Rate limiting

### 2. Timeout Prevention

**Current Issue:** Analysis gets stuck in parsing logic
**Solution:** Direct narrative acceptance eliminates parsing bottleneck

**Timeout Strategy:**
- DeepSeek API timeout: 60 seconds (configurable)
- Total analysis timeout: 90 seconds
- No parsing timeout needed (eliminated)

## Testing Strategy

### 1. Unit Tests

**Remove Complex Parsing Tests:**
- Delete tests for structured data extraction
- Delete tests for natural language parsing fallbacks
- Delete tests for skill categorization logic

**Add Narrative Tests:**
```typescript
describe('Narrative Analysis', () => {
  it('should accept narrative response directly', () => {
    const narrative = "John Doe has built a strong foundation...";
    const result = processNarrativeResponse(narrative);
    expect(result.narrative).toBe(narrative);
  });

  it('should calculate word count correctly', () => {
    const narrative = "This is a test narrative.";
    const result = processNarrativeResponse(narrative);
    expect(result.wordCount).toBe(5);
  });
});
```

### 2. Integration Tests

**Test Scenarios:**
- CV analysis without job description → standalone narrative
- CV analysis with job description → comparison narrative
- Long CV content → narrative within reasonable length
- DeepSeek API variations → consistent narrative handling

### 3. Performance Tests

**Metrics to Track:**
- Analysis completion time (should improve significantly)
- Success rate (should increase from current timeout issues)
- User satisfaction with narrative quality
- API response time consistency

## Implementation Phases

### Phase 1: Core Narrative Processing
- Simplify DeepSeek AI service to accept narrative directly
- Update response format to narrative-focused structure
- Remove complex parsing logic

### Phase 2: Database and Storage
- Update database schema for narrative storage
- Implement narrative caching strategy
- Update analysis retrieval endpoints

### Phase 3: API Response Updates
- Modify analysis endpoints to return narrative format
- Update status checking to handle narrative results
- Ensure backward compatibility during transition

### Phase 4: Testing and Optimization
- Comprehensive testing of narrative flow
- Performance optimization and monitoring
- User feedback collection and iteration

## Migration Strategy

### 1. Backward Compatibility
- Maintain existing API endpoints during transition
- Gradually migrate users to narrative format
- Provide feature flags for A/B testing

### 2. Data Migration
- Existing structured analyses can remain as-is
- New analyses use narrative format
- Optional: Convert existing analyses to narrative summaries

### 3. Rollout Plan
- Deploy to staging environment first
- Limited user testing with narrative format
- Gradual rollout to production users
- Monitor success rates and user feedback

## Success Metrics

### 1. Technical Metrics
- **Analysis Success Rate:** Target >95% (up from current timeout issues)
- **Average Processing Time:** Target <30 seconds (down from 120+ second timeouts)
- **Error Rate:** Target <2% (down from parsing failures)

### 2. User Experience Metrics
- **User Satisfaction:** Measure feedback on narrative quality
- **Engagement:** Time spent reading analysis results
- **Retention:** Users returning for additional analyses

### 3. Cloudflare Free Plan Efficiency
- **D1 Operations:** Stay within 100K writes/day limit
- **KV Operations:** Optimize to stay within 100K ops/day
- **Worker CPU Time:** Reduced complexity should improve CPU usage
- **Memory Usage:** Simplified processing reduces memory footprint

### 4. Cost Optimization
- **Reduced Processing Overhead:** Eliminate complex parsing logic
- **Improved Resource Utilization:** Better fit for Cloudflare free tier limits
- **Maintenance Efficiency:** Reduced complexity and bug reports