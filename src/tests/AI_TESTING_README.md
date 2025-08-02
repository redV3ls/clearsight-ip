# AI Services Testing Guide

This document provides comprehensive information about testing the AI-powered CV analysis services in the ClearSight IP platform.

## Overview

The AI testing suite includes four main test files that cover different aspects of the AI-powered CV analysis system:

1. **`deepseekAI.test.ts`** - Unit tests for the DeepSeek AI service
2. **`aiAnalysisService.test.ts`** - Integration tests for the AI analysis orchestration
3. **`aiAnalysisPipeline.integration.test.ts`** - End-to-end pipeline tests
4. **`aiQualityValidation.test.ts`** - Quality validation and accuracy tests

## Test Categories

### Unit Tests (`deepseekAI.test.ts`)
- **Purpose**: Test individual methods of the DeepSeek AI service
- **Coverage**: API calls, response parsing, error handling, rate limiting
- **Mocking**: All API calls are mocked for consistent testing
- **Key Tests**:
  - Skills extraction from CV text
  - Job description analysis
  - Gap analysis generation
  - Error handling and retries
  - Rate limiting behavior
  - Health check functionality

### Integration Tests (`aiAnalysisService.test.ts`)
- **Purpose**: Test the AI analysis service orchestration
- **Coverage**: Service initialization, fallback mechanisms, full analysis flow
- **Key Tests**:
  - AI service initialization with/without configuration
  - Complete CV analysis with AI enabled
  - Fallback to rule-based analysis when AI fails
  - Health monitoring and status reporting
  - Performance metrics tracking

### End-to-End Tests (`aiAnalysisPipeline.integration.test.ts`)
- **Purpose**: Test the complete analysis pipeline with realistic data
- **Coverage**: Full workflow from CV input to analysis output
- **Key Tests**:
  - Complete analysis with CV and job description
  - CV-only analysis scenarios
  - Error handling and resilience
  - Performance characteristics
  - Concurrent request handling

### Quality Validation Tests (`aiQualityValidation.test.ts`)
- **Purpose**: Validate the quality and accuracy of AI analysis results
- **Coverage**: Skills extraction accuracy, job analysis quality, gap analysis realism
- **Key Tests**:
  - Skills extraction for different experience levels
  - Consistent skill categorization
  - Realistic confidence scores
  - Job requirement importance classification
  - Match score accuracy
  - Response consistency

## Running Tests

### Prerequisites

1. **Node.js**: Version 20.8.0 or higher
2. **Dependencies**: Run `npm install` to install all dependencies
3. **DeepSeek API Key** (optional): Set `DEEPSEEK_API_KEY` environment variable for full integration testing

### Test Commands

```bash
# Run all AI tests with comprehensive reporting
npm run test:ai

# Run only unit tests
npm run test:ai:unit

# Run only integration tests
npm run test:ai:integration

# Run only quality validation tests
npm run test:ai:quality

# Run tests with coverage report
npm run test:ai:coverage

# Run individual test files
npx vitest run src/tests/deepseekAI.test.ts
npx vitest run src/tests/aiAnalysisService.test.ts
npx vitest run src/tests/aiAnalysisPipeline.integration.test.ts
npx vitest run src/tests/aiQualityValidation.test.ts
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DEEPSEEK_API_KEY` | Optional | DeepSeek API key for real API testing |
| `DEEPSEEK_BASE_URL` | Optional | Custom API base URL (defaults to official) |
| `AI_MAX_TOKENS` | Optional | Maximum tokens per request (default: 4000) |
| `AI_TEMPERATURE` | Optional | AI temperature setting (default: 0.1) |
| `AI_TIMEOUT` | Optional | Request timeout in milliseconds (default: 30000) |

## Test Data

### Sample CV Data
The tests use realistic CV samples representing different experience levels:
- **Senior Developer**: 6+ years experience, leadership skills, certifications
- **Mid-Level Developer**: 3-4 years experience, solid technical skills
- **Entry-Level Developer**: Recent graduate, basic skills, internship experience

### Sample Job Descriptions
Job descriptions cover various roles and requirements:
- **Senior Positions**: Leadership requirements, advanced technical skills
- **Mid-Level Positions**: Solid technical foundation, some mentoring
- **Entry-Level Positions**: Basic requirements, training opportunities

## Mocking Strategy

### API Response Mocking
- All DeepSeek API calls are mocked using Vitest's `vi.spyOn(global, 'fetch')`
- Mock responses are realistic and based on actual API response formats
- Different prompts trigger different mock responses for comprehensive testing

### Mock Response Types
1. **Skills Analysis**: Structured skill extraction with categories and confidence scores
2. **Job Analysis**: Job requirement parsing with importance classification
3. **Gap Analysis**: Skill gap identification with learning recommendations
4. **Error Responses**: Various error scenarios for resilience testing

## Quality Metrics

### Coverage Targets
- **Unit Tests**: >90% code coverage for core AI service methods
- **Integration Tests**: >80% coverage for analysis pipeline
- **Error Handling**: 100% coverage for error scenarios

### Performance Benchmarks
- **Single Analysis**: <5 seconds for complete CV analysis
- **Concurrent Requests**: Handle 3+ simultaneous analyses
- **Fallback Speed**: <1 second fallback to rule-based analysis

### Quality Validation
- **Skills Extraction**: Accurate identification of technical and soft skills
- **Experience Level**: Correct classification of career levels
- **Match Scores**: Realistic percentage matches (0-100%)
- **Gap Identification**: Accurate skill gap analysis with priorities

## Troubleshooting

### Common Issues

#### Tests Failing Due to Missing API Key
```bash
# Error: AI service not available
# Solution: Tests should pass with mocked responses even without API key
# Check that mocks are properly configured
```

#### Network-Related Test Failures
```bash
# Error: fetch is not defined
# Solution: Ensure global fetch is properly mocked in test setup
```

#### Timeout Issues
```bash
# Error: Test timeout
# Solution: Increase test timeout or check for infinite loops in mocks
```

### Debug Mode
```bash
# Run tests with verbose output
npx vitest run --reporter=verbose src/tests/deepseekAI.test.ts

# Run tests in watch mode for development
npx vitest src/tests/aiAnalysisService.test.ts
```

## Test Maintenance

### Adding New Tests
1. Follow existing test structure and naming conventions
2. Use realistic test data that represents actual use cases
3. Include both success and error scenarios
4. Add appropriate mocks for external dependencies

### Updating Mock Responses
1. Keep mock responses in sync with actual API response formats
2. Update mocks when AI service interfaces change
3. Ensure mock data represents realistic analysis results

### Performance Testing
1. Monitor test execution times
2. Update performance benchmarks as system evolves
3. Add new performance tests for new features

## Integration with CI/CD

### GitHub Actions
```yaml
- name: Run AI Tests
  run: npm run test:ai
  env:
    DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
```

### Local Development
```bash
# Run tests before committing
npm run test:ai

# Run with coverage for code quality checks
npm run test:ai:coverage
```

## Future Enhancements

### Planned Test Improvements
1. **Load Testing**: Add tests for high-volume analysis scenarios
2. **Multi-language Testing**: Test CV analysis in different languages
3. **Industry-Specific Testing**: Validate analysis for different industries
4. **Real API Testing**: Optional tests against live API with rate limiting

### Test Data Expansion
1. **More CV Samples**: Add CVs from different industries and roles
2. **Edge Cases**: Test with unusual or malformed CV content
3. **Multilingual Content**: Test with non-English CVs and job descriptions

## Support

For questions about AI testing:
1. Check this README for common issues
2. Review test files for examples
3. Check the main project documentation
4. Contact the development team for AI-specific questions

---

**Note**: These tests are designed to work with or without a real DeepSeek API key. When no API key is provided, all tests use mocked responses to ensure consistent and reliable testing.