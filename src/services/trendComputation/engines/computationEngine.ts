/**
 * Computation Engine
 * 
 * Core computation algorithms for trend analysis, forecasting,
 * and statistical calculations used across all trend computation jobs.
 */

import { logger } from '../../../utils/logger';
import { 
  SkillTrendData,
  EmergingSkillData,
  RegionalTrendData,
  ForecastData,
  TrendAnalysisParams,
  ForecastParams,
  RegionalAnalysisParams,
  AlgorithmConfig
} from '../core/types';

export class ComputationEngine {
  private algorithms: Map<string, AlgorithmConfig> = new Map();

  constructor() {
    this.initializeAlgorithms();
  }

  /**
   * Calculates skill demand trends from historical data
   */
  async calculateSkillTrends(
    skillData: Array<{ skillName: string; demand: number; timestamp: string }>,
    params: TrendAnalysisParams
  ): Promise<SkillTrendData[]> {
    try {
      logger.info('Calculating skill trends', { 
        skillCount: new Set(skillData.map(d => d.skillName)).size,
        dataPoints: skillData.length,
        params 
      });

      const skillGroups = this.groupBySkill(skillData);
      const trends: SkillTrendData[] = [];

      for (const [skillName, data] of skillGroups.entries()) {
        if (data.length < params.minDataPoints) {
          logger.warn(`Insufficient data points for skill: ${skillName}`, { 
            dataPoints: data.length,
            required: params.minDataPoints 
          });
          continue;
        }

        const trendData = await this.calculateSingleSkillTrend(skillName, data, params);
        if (trendData.confidence >= params.confidenceThreshold) {
          trends.push(trendData);
        }
      }

      logger.info('Skill trends calculated', { trendsGenerated: trends.length });
      return trends;

    } catch (error) {
      logger.error('Failed to calculate skill trends', error);
      throw error;
    }
  }

  /**
   * Identifies emerging skills based on growth patterns
   */
  async identifyEmergingSkills(
    skillData: Array<{ skillName: string; demand: number; timestamp: string }>,
    threshold: { minGrowthRate: number; minEmergenceScore: number }
  ): Promise<EmergingSkillData[]> {
    try {
      logger.info('Identifying emerging skills', { 
        dataPoints: skillData.length,
        threshold 
      });

      const skillGroups = this.groupBySkill(skillData);
      const emergingSkills: EmergingSkillData[] = [];

      for (const [skillName, data] of skillGroups.entries()) {
        const emergingData = await this.analyzeSkillEmergence(skillName, data, threshold);
        
        if (emergingData && emergingData.emergenceScore >= threshold.minEmergenceScore) {
          emergingSkills.push(emergingData);
        }
      }

      // Sort by emergence score
      emergingSkills.sort((a, b) => b.emergenceScore - a.emergenceScore);

      logger.info('Emerging skills identified', { 
        emergingSkillsCount: emergingSkills.length 
      });

      return emergingSkills;

    } catch (error) {
      logger.error('Failed to identify emerging skills', error);
      throw error;
    }
  }

  /**
   * Analyzes regional trends for skills
   */
  async analyzeRegionalTrends(
    regionalData: Array<{
      skillName: string;
      region: string;
      country: string;
      city?: string;
      demand: number;
      salary?: number;
      jobCount: number;
      timestamp: string;
    }>,
    params: RegionalAnalysisParams
  ): Promise<RegionalTrendData[]> {
    try {
      logger.info('Analyzing regional trends', { 
        dataPoints: regionalData.length,
        regions: params.regions.length,
        params 
      });

      const filteredData = regionalData.filter(d => 
        params.regions.length === 0 || params.regions.includes(d.region)
      );

      const regionalTrends: RegionalTrendData[] = [];
      const groupKey = (item: any) => `${item.skillName}-${item.region}-${item.country}${item.city ? '-' + item.city : ''}`;
      const groups = this.groupBy(filteredData, groupKey);

      for (const [key, data] of groups.entries()) {
        const trend = await this.calculateRegionalTrend(data, params);
        if (trend) {
          regionalTrends.push(trend);
        }
      }

      logger.info('Regional trends analyzed', { 
        trendsGenerated: regionalTrends.length 
      });

      return regionalTrends;

    } catch (error) {
      logger.error('Failed to analyze regional trends', error);
      throw error;
    }
  }

  /**
   * Generates forecasts for skill demand
   */
  async generateForecasts(
    historicalData: Array<{ skillName: string; demand: number; timestamp: string }>,
    params: ForecastParams
  ): Promise<ForecastData[]> {
    try {
      logger.info('Generating forecasts', { 
        dataPoints: historicalData.length,
        horizon: params.horizon,
        method: params.method 
      });

      const skillGroups = this.groupBySkill(historicalData);
      const forecasts: ForecastData[] = [];

      for (const [skillName, data] of skillGroups.entries()) {
        if (data.length < 12) { // Need at least 12 data points for forecasting
          continue;
        }

        const forecast = await this.generateSingleForecast(skillName, data, params);
        if (forecast) {
          forecasts.push(forecast);
        }
      }

      logger.info('Forecasts generated', { forecastsGenerated: forecasts.length });
      return forecasts;

    } catch (error) {
      logger.error('Failed to generate forecasts', error);
      throw error;
    }
  }

  /**
   * Validates forecast accuracy against actual data
   */
  async validateForecastAccuracy(
    forecasts: ForecastData[],
    actualData: Array<{ skillName: string; demand: number; timestamp: string }>
  ): Promise<Array<{ forecast: ForecastData; accuracy: number; error: number }>> {
    try {
      logger.info('Validating forecast accuracy', { 
        forecastCount: forecasts.length,
        actualDataPoints: actualData.length 
      });

      const validations = [];
      const actualDataMap = this.groupBySkill(actualData);

      for (const forecast of forecasts) {
        const actualSkillData = actualDataMap.get(forecast.skillName);
        if (!actualSkillData || actualSkillData.length === 0) {
          continue;
        }

        // Find the closest actual data point to the forecast horizon
        const forecastDate = new Date(forecast.createdAt);
        forecastDate.setMonth(forecastDate.getMonth() + forecast.forecastHorizon);

        const closestActual = this.findClosestDataPoint(actualSkillData, forecastDate);
        if (closestActual) {
          const error = Math.abs(forecast.predictedDemand - closestActual.demand);
          const accuracy = Math.max(0, 1 - (error / Math.max(forecast.predictedDemand, closestActual.demand)));

          validations.push({
            forecast,
            accuracy,
            error
          });
        }
      }

      logger.info('Forecast validation completed', { 
        validationsGenerated: validations.length 
      });

      return validations;

    } catch (error) {
      logger.error('Failed to validate forecast accuracy', error);
      throw error;
    }
  }

  // Private computation methods

  /**
   * Calculates trend for a single skill
   */
  private async calculateSingleSkillTrend(
    skillName: string,
    data: Array<{ demand: number; timestamp: string }>,
    params: TrendAnalysisParams
  ): Promise<SkillTrendData> {
    // Sort data by timestamp
    const sortedData = data.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Apply smoothing if enabled
    const smoothedData = params.smoothingFactor > 0 
      ? this.applyExponentialSmoothing(sortedData, params.smoothingFactor)
      : sortedData;

    // Remove outliers if enabled
    const cleanData = params.outlierDetection 
      ? this.removeOutliers(smoothedData)
      : smoothedData;

    // Calculate trend metrics
    const currentDemand = cleanData[cleanData.length - 1]?.demand || 0;
    const growthRate = this.calculateGrowthRate(cleanData);
    const trend = this.determineTrendDirection(growthRate);
    const volatility = this.calculateVolatility(cleanData);
    const confidence = this.calculateTrendConfidence(cleanData, growthRate, volatility);

    return {
      skillName,
      currentDemand,
      growthRate,
      confidence,
      dataPoints: cleanData.length,
      lastUpdated: new Date().toISOString(),
      trend,
      volatility
    };
  }

  /**
   * Analyzes skill emergence patterns
   */
  private async analyzeSkillEmergence(
    skillName: string,
    data: Array<{ demand: number; timestamp: string }>,
    threshold: { minGrowthRate: number; minEmergenceScore: number }
  ): Promise<EmergingSkillData | null> {
    if (data.length < 6) return null; // Need at least 6 months of data

    const sortedData = data.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const growthVelocity = this.calculateGrowthVelocity(sortedData);
    const adoptionRate = this.calculateAdoptionRate(sortedData);
    const emergenceScore = this.calculateEmergenceScore(growthVelocity, adoptionRate, sortedData);

    if (emergenceScore < threshold.minEmergenceScore) {
      return null;
    }

    // Get related skills and industries (mock data for now)
    const relatedSkills = await this.findRelatedSkills(skillName);
    const industries = await this.findSkillIndustries(skillName);
    const category = await this.getSkillCategory(skillName);

    return {
      skillName,
      emergenceScore,
      growthVelocity,
      adoptionRate,
      relatedSkills,
      industries,
      confidence: Math.min(0.95, emergenceScore * 0.8 + adoptionRate * 0.2),
      firstDetected: sortedData[0].timestamp,
      category
    };
  }

  /**
   * Calculates regional trend for grouped data
   */
  private async calculateRegionalTrend(
    data: Array<{
      skillName: string;
      region: string;
      country: string;
      city?: string;
      demand: number;
      salary?: number;
      jobCount: number;
      timestamp: string;
    }>,
    params: RegionalAnalysisParams
  ): Promise<RegionalTrendData | null> {
    if (data.length === 0) return null;

    const latest = data[data.length - 1];
    const sortedData = data.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const demandTrend = this.calculateGrowthRate(
      sortedData.map(d => ({ demand: d.demand, timestamp: d.timestamp }))
    );

    const salaryTrend = sortedData.some(d => d.salary) 
      ? this.calculateGrowthRate(
          sortedData.filter(d => d.salary).map(d => ({ demand: d.salary!, timestamp: d.timestamp }))
        )
      : 0;

    return {
      region: latest.region,
      country: latest.country,
      city: latest.city,
      skillName: latest.skillName,
      demandLevel: latest.demand,
      growthRate: demandTrend,
      salaryTrend,
      jobCount: latest.jobCount,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Generates forecast for a single skill
   */
  private async generateSingleForecast(
    skillName: string,
    data: Array<{ demand: number; timestamp: string }>,
    params: ForecastParams
  ): Promise<ForecastData | null> {
    const sortedData = data.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let predictedDemand: number;
    let confidence: number;
    let methodology: string;
    let factors: string[] = [];

    switch (params.method) {
      case 'linear':
        const linearResult = this.linearForecast(sortedData, params.horizon);
        predictedDemand = linearResult.prediction;
        confidence = linearResult.confidence;
        methodology = 'Linear Regression';
        factors = ['Historical trend', 'Linear extrapolation'];
        break;

      case 'exponential':
        const expResult = this.exponentialForecast(sortedData, params.horizon);
        predictedDemand = expResult.prediction;
        confidence = expResult.confidence;
        methodology = 'Exponential Smoothing';
        factors = ['Exponential trend', 'Weighted recent data'];
        break;

      case 'arima':
        const arimaResult = this.arimaForecast(sortedData, params.horizon);
        predictedDemand = arimaResult.prediction;
        confidence = arimaResult.confidence;
        methodology = 'ARIMA Model';
        factors = ['Autoregressive', 'Moving average', 'Differencing'];
        break;

      default:
        return null;
    }

    // Apply seasonality adjustment if enabled
    if (params.includeSeasonality) {
      const seasonalAdjustment = this.calculateSeasonalAdjustment(sortedData, params.horizon);
      predictedDemand *= seasonalAdjustment;
      factors.push('Seasonal adjustment');
    }

    // Apply external factors if enabled
    if (params.includeExternalFactors) {
      const externalAdjustment = await this.calculateExternalFactors(skillName);
      predictedDemand *= externalAdjustment;
      factors.push('External market factors');
    }

    return {
      skillName,
      forecastHorizon: params.horizon,
      predictedDemand: Math.max(0, predictedDemand),
      confidence: Math.min(0.95, confidence),
      methodology,
      factors,
      createdAt: new Date().toISOString()
    };
  }

  // Utility methods

  private groupBySkill(data: Array<{ skillName: string; [key: string]: any }>): Map<string, any[]> {
    return this.groupBy(data, item => item.skillName);
  }

  private groupBy<T>(data: T[], keyFn: (item: T) => string): Map<string, T[]> {
    const groups = new Map<string, T[]>();
    
    for (const item of data) {
      const key = keyFn(item);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    }
    
    return groups;
  }

  private calculateGrowthRate(data: Array<{ demand: number; timestamp: string }>): number {
    if (data.length < 2) return 0;

    const first = data[0].demand;
    const last = data[data.length - 1].demand;
    
    if (first === 0) return last > 0 ? 1 : 0;
    
    return (last - first) / first;
  }

  private calculateGrowthVelocity(data: Array<{ demand: number; timestamp: string }>): number {
    if (data.length < 3) return 0;

    const growthRates = [];
    for (let i = 1; i < data.length; i++) {
      const prev = data[i - 1].demand;
      const curr = data[i].demand;
      if (prev > 0) {
        growthRates.push((curr - prev) / prev);
      }
    }

    // Calculate acceleration (change in growth rate)
    if (growthRates.length < 2) return 0;
    
    const recentGrowth = growthRates.slice(-3).reduce((sum, rate) => sum + rate, 0) / 3;
    const earlierGrowth = growthRates.slice(0, 3).reduce((sum, rate) => sum + rate, 0) / 3;
    
    return recentGrowth - earlierGrowth;
  }

  private calculateAdoptionRate(data: Array<{ demand: number; timestamp: string }>): number {
    if (data.length === 0) return 0;

    const maxDemand = Math.max(...data.map(d => d.demand));
    const currentDemand = data[data.length - 1].demand;
    
    return maxDemand > 0 ? currentDemand / maxDemand : 0;
  }

  private calculateEmergenceScore(growthVelocity: number, adoptionRate: number, data: any[]): number {
    const velocityScore = Math.min(1, Math.max(0, growthVelocity * 10));
    const adoptionScore = adoptionRate;
    const dataQualityScore = Math.min(1, data.length / 12); // Prefer more data points
    
    return (velocityScore * 0.5 + adoptionScore * 0.3 + dataQualityScore * 0.2);
  }

  private determineTrendDirection(growthRate: number): 'increasing' | 'stable' | 'decreasing' {
    if (growthRate > 0.05) return 'increasing';
    if (growthRate < -0.05) return 'decreasing';
    return 'stable';
  }

  private calculateVolatility(data: Array<{ demand: number; timestamp: string }>): number {
    if (data.length < 2) return 0;

    const values = data.map(d => d.demand);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance) / mean;
  }

  private calculateTrendConfidence(data: any[], growthRate: number, volatility: number): number {
    const dataQualityScore = Math.min(1, data.length / 24); // Prefer 2+ years of data
    const stabilityScore = Math.max(0, 1 - volatility);
    const significanceScore = Math.min(1, Math.abs(growthRate) * 2);
    
    return (dataQualityScore * 0.4 + stabilityScore * 0.4 + significanceScore * 0.2);
  }

  // Forecasting algorithms (simplified implementations)

  private linearForecast(data: any[], horizon: number): { prediction: number; confidence: number } {
    const growthRate = this.calculateGrowthRate(data);
    const currentDemand = data[data.length - 1].demand;
    const prediction = currentDemand * (1 + growthRate * (horizon / 12));
    const confidence = Math.max(0.3, 0.8 - (horizon / 24) * 0.1);
    
    return { prediction, confidence };
  }

  private exponentialForecast(data: any[], horizon: number): { prediction: number; confidence: number } {
    const alpha = 0.3; // Smoothing parameter
    let smoothed = data[0].demand;
    
    for (let i = 1; i < data.length; i++) {
      smoothed = alpha * data[i].demand + (1 - alpha) * smoothed;
    }
    
    const prediction = smoothed;
    const confidence = Math.max(0.4, 0.7 - (horizon / 24) * 0.1);
    
    return { prediction, confidence };
  }

  private arimaForecast(data: any[], horizon: number): { prediction: number; confidence: number } {
    // Simplified ARIMA implementation
    const values = data.map(d => d.demand);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const trend = this.calculateGrowthRate(data);
    
    const prediction = mean * (1 + trend * (horizon / 12));
    const confidence = Math.max(0.5, 0.8 - (horizon / 24) * 0.05);
    
    return { prediction, confidence };
  }

  private applyExponentialSmoothing(data: any[], factor: number): any[] {
    if (data.length === 0) return data;
    
    const smoothed = [data[0]];
    
    for (let i = 1; i < data.length; i++) {
      const smoothedValue = factor * data[i].demand + (1 - factor) * smoothed[i - 1].demand;
      smoothed.push({ ...data[i], demand: smoothedValue });
    }
    
    return smoothed;
  }

  private removeOutliers(data: any[]): any[] {
    if (data.length < 4) return data;
    
    const values = data.map(d => d.demand);
    const q1 = this.percentile(values, 25);
    const q3 = this.percentile(values, 75);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return data.filter(d => d.demand >= lowerBound && d.demand <= upperBound);
  }

  private percentile(values: number[], p: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) return sorted[lower];
    
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  private calculateSeasonalAdjustment(data: any[], horizon: number): number {
    // Simplified seasonal adjustment
    const monthlyData = this.groupByMonth(data);
    const currentMonth = new Date().getMonth();
    const targetMonth = (currentMonth + horizon) % 12;
    
    const currentAvg = monthlyData.get(currentMonth) || 1;
    const targetAvg = monthlyData.get(targetMonth) || 1;
    
    return targetAvg / currentAvg;
  }

  private groupByMonth(data: any[]): Map<number, number> {
    const monthlyGroups = new Map<number, number[]>();
    
    for (const item of data) {
      const month = new Date(item.timestamp).getMonth();
      if (!monthlyGroups.has(month)) {
        monthlyGroups.set(month, []);
      }
      monthlyGroups.get(month)!.push(item.demand);
    }
    
    const monthlyAverages = new Map<number, number>();
    for (const [month, values] of monthlyGroups.entries()) {
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      monthlyAverages.set(month, avg);
    }
    
    return monthlyAverages;
  }

  private async calculateExternalFactors(skillName: string): Promise<number> {
    // Mock external factors calculation
    // In production, this would consider economic indicators, industry trends, etc.
    return 1.0 + (Math.random() - 0.5) * 0.2; // ±10% adjustment
  }

  private findClosestDataPoint(data: any[], targetDate: Date): any | null {
    if (data.length === 0) return null;
    
    let closest = data[0];
    let minDiff = Math.abs(new Date(data[0].timestamp).getTime() - targetDate.getTime());
    
    for (const item of data) {
      const diff = Math.abs(new Date(item.timestamp).getTime() - targetDate.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closest = item;
      }
    }
    
    return closest;
  }

  // Mock helper methods (would be replaced with real implementations)
  private async findRelatedSkills(skillName: string): Promise<string[]> {
    const relatedSkillsMap: Record<string, string[]> = {
      'JavaScript': ['TypeScript', 'React', 'Node.js'],
      'Python': ['Django', 'Flask', 'Data Science'],
      'React': ['JavaScript', 'Redux', 'Next.js']
    };
    return relatedSkillsMap[skillName] || [];
  }

  private async findSkillIndustries(skillName: string): Promise<string[]> {
    const skillIndustriesMap: Record<string, string[]> = {
      'JavaScript': ['Technology', 'E-commerce', 'Media'],
      'Python': ['Technology', 'Finance', 'Healthcare'],
      'React': ['Technology', 'Startups', 'E-commerce']
    };
    return skillIndustriesMap[skillName] || ['Technology'];
  }

  private async getSkillCategory(skillName: string): Promise<string> {
    const categoryMap: Record<string, string> = {
      'JavaScript': 'Programming',
      'Python': 'Programming',
      'React': 'Web Development',
      'AWS': 'Cloud Computing',
      'Docker': 'DevOps'
    };
    return categoryMap[skillName] || 'Technology';
  }

  private initializeAlgorithms(): void {
    // Initialize algorithm configurations
    this.algorithms.set('linear-regression', {
      name: 'Linear Regression',
      type: 'statistical',
      parameters: { confidence: 0.8 },
      version: '1.0',
      accuracy: 0.75
    });

    this.algorithms.set('exponential-smoothing', {
      name: 'Exponential Smoothing',
      type: 'statistical',
      parameters: { alpha: 0.3 },
      version: '1.0',
      accuracy: 0.70
    });

    this.algorithms.set('arima', {
      name: 'ARIMA',
      type: 'statistical',
      parameters: { p: 1, d: 1, q: 1 },
      version: '1.0',
      accuracy: 0.80
    });
  }
}