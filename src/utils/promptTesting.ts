/**
 * Prompt Testing Utility for Narrative Analysis
 * Helps validate prompt effectiveness and consistency
 */

export interface PromptTestResult {
  wordCount: number;
  hasPersonalTone: boolean;
  hasActionableAdvice: boolean;
  hasCareerStory: boolean;
  hasSpecificExamples: boolean;
  structureScore: number; // 0-10
  engagementScore: number; // 0-10
  issues: string[];
}

export class PromptTester {
  /**
   * Analyze the quality of a narrative response
   */
  static analyzeNarrativeQuality(narrative: string): PromptTestResult {
    const wordCount = narrative.trim().split(/\s+/).length;
    const lowerNarrative = narrative.toLowerCase();
    
    // Check for personal tone indicators
    const personalToneIndicators = [
      'you', 'your', 'you\'ve', 'you\'ll', 'you\'re',
      'i see', 'i notice', 'i recommend', 'consider',
      'think about', 'focus on'
    ];
    const hasPersonalTone = personalToneIndicators.some(indicator => 
      lowerNarrative.includes(indicator)
    );

    // Check for actionable advice
    const actionableIndicators = [
      'should', 'could', 'consider', 'try', 'focus on',
      'develop', 'strengthen', 'improve', 'next step',
      'recommend', 'suggest', 'opportunity'
    ];
    const hasActionableAdvice = actionableIndicators.some(indicator => 
      lowerNarrative.includes(indicator)
    );

    // Check for career story elements
    const storyIndicators = [
      'journey', 'progression', 'experience', 'background',
      'career', 'path', 'growth', 'development', 'evolved',
      'built', 'established', 'demonstrated'
    ];
    const hasCareerStory = storyIndicators.some(indicator => 
      lowerNarrative.includes(indicator)
    );

    // Check for specific examples
    const exampleIndicators = [
      'for example', 'such as', 'including', 'particularly',
      'specifically', 'notably', 'demonstrated by'
    ];
    const hasSpecificExamples = exampleIndicators.some(indicator => 
      lowerNarrative.includes(indicator)
    );

    // Calculate structure score (0-10)
    let structureScore = 0;
    const paragraphs = narrative.split('\n\n').filter(p => p.trim().length > 0);
    
    if (paragraphs.length >= 3) structureScore += 3; // Good paragraph structure
    if (wordCount >= 300 && wordCount <= 500) structureScore += 3; // Appropriate length
    if (hasCareerStory) structureScore += 2; // Contains career narrative
    if (hasActionableAdvice) structureScore += 2; // Contains actionable advice

    // Calculate engagement score (0-10)
    let engagementScore = 0;
    if (hasPersonalTone) engagementScore += 3; // Personal tone
    if (hasSpecificExamples) engagementScore += 2; // Specific examples
    if (!lowerNarrative.includes('bullet') && !lowerNarrative.includes('list')) {
      engagementScore += 2; // Avoids list format
    }
    if (narrative.includes('!') || narrative.includes('?')) {
      engagementScore += 1; // Uses engaging punctuation
    }
    if (lowerNarrative.includes('strength') || lowerNarrative.includes('strong')) {
      engagementScore += 2; // Highlights strengths
    }

    // Identify issues
    const issues: string[] = [];
    if (wordCount < 250) issues.push('Response too short (under 250 words)');
    if (wordCount > 600) issues.push('Response too long (over 600 words)');
    if (!hasPersonalTone) issues.push('Lacks personal tone (missing "you/your")');
    if (!hasActionableAdvice) issues.push('Missing actionable recommendations');
    if (!hasCareerStory) issues.push('Lacks career narrative elements');
    if (paragraphs.length < 2) issues.push('Poor paragraph structure');
    if (lowerNarrative.includes('bullet') || lowerNarrative.includes('•')) {
      issues.push('Contains bullet points (should be narrative)');
    }
    if (lowerNarrative.includes('skills:') || lowerNarrative.includes('experience:')) {
      issues.push('Contains structured sections (should be pure narrative)');
    }

    return {
      wordCount,
      hasPersonalTone,
      hasActionableAdvice,
      hasCareerStory,
      hasSpecificExamples,
      structureScore: Math.min(10, structureScore),
      engagementScore: Math.min(10, engagementScore),
      issues
    };
  }

  /**
   * Generate a quality score (0-100) for a narrative
   */
  static calculateQualityScore(result: PromptTestResult): number {
    const structureWeight = 0.4;
    const engagementWeight = 0.4;
    const issuesPenaltyRate = 0.2;

    const structurePoints = (result.structureScore / 10) * structureWeight * 100;
    const engagementPoints = (result.engagementScore / 10) * engagementWeight * 100;
    const issuesPenalty = Math.min(result.issues.length * 10, issuesPenaltyRate * 100);

    return Math.max(0, Math.round(structurePoints + engagementPoints - issuesPenalty));
  }

  /**
   * Test multiple prompts and compare their effectiveness
   */
  static comparePrompts(responses: Array<{ prompt: string; response: string }>): Array<{
    prompt: string;
    response: string;
    analysis: PromptTestResult;
    qualityScore: number;
  }> {
    return responses.map(({ prompt, response }) => {
      const analysis = this.analyzeNarrativeQuality(response);
      const qualityScore = this.calculateQualityScore(analysis);
      
      return {
        prompt,
        response,
        analysis,
        qualityScore
      };
    });
  }

  /**
   * Generate prompt optimization suggestions
   */
  static generateOptimizationSuggestions(results: PromptTestResult[]): string[] {
    const suggestions: string[] = [];
    const avgWordCount = results.reduce((sum, r) => sum + r.wordCount, 0) / results.length;
    const personalToneRate = results.filter(r => r.hasPersonalTone).length / results.length;
    const actionableRate = results.filter(r => r.hasActionableAdvice).length / results.length;
    const storyRate = results.filter(r => r.hasCareerStory).length / results.length;

    if (avgWordCount < 300) {
      suggestions.push('Encourage longer responses by asking for more detailed analysis');
    }
    if (avgWordCount > 500) {
      suggestions.push('Add word count guidance to keep responses concise');
    }
    if (personalToneRate < 0.8) {
      suggestions.push('Emphasize direct address ("you/your") in prompt instructions');
    }
    if (actionableRate < 0.9) {
      suggestions.push('Explicitly request actionable recommendations and next steps');
    }
    if (storyRate < 0.8) {
      suggestions.push('Strengthen storytelling instructions and career journey focus');
    }

    const commonIssues = results.flatMap(r => r.issues);
    const issueFrequency = commonIssues.reduce((acc, issue) => {
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(issueFrequency)
      .filter(([_, count]) => count > results.length * 0.3) // Issues in >30% of responses
      .forEach(([issue, _]) => {
        suggestions.push(`Address common issue: ${issue}`);
      });

    return suggestions;
  }

  /**
   * Validate prompt consistency across multiple test cases
   */
  static validatePromptConsistency(
    testCases: Array<{ input: string; expectedElements: string[] }>,
    responses: string[]
  ): {
    consistencyScore: number;
    missingElements: Array<{ testCase: number; missing: string[] }>;
    recommendations: string[];
  } {
    const results = responses.map((response, index) => {
      const testCase = testCases[index];
      const lowerResponse = response.toLowerCase();
      const missing = testCase.expectedElements.filter(element => 
        !lowerResponse.includes(element.toLowerCase())
      );
      
      return { testCase: index, missing };
    });

    const totalElements = testCases.reduce((sum, tc) => sum + tc.expectedElements.length, 0);
    const missingCount = results.reduce((sum, r) => sum + r.missing.length, 0);
    const consistencyScore = Math.round(((totalElements - missingCount) / totalElements) * 100);

    const recommendations: string[] = [];
    if (consistencyScore < 80) {
      recommendations.push('Improve prompt clarity to ensure consistent element inclusion');
    }
    if (consistencyScore < 60) {
      recommendations.push('Consider breaking down complex requirements into simpler instructions');
    }

    return {
      consistencyScore,
      missingElements: results.filter(r => r.missing.length > 0),
      recommendations
    };
  }
}