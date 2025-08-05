/**
 * Forecasting Engine
 * 
 * Advanced forecasting algorithms for skill demand prediction.
 * Supports multiple forecasting methods and ensemble approaches.
 */

import { logger } from '../../../utils/logger';
import { 
  SkillForecast,
  ForecastingOptions,
  AnalysisContext,
  AnalysisResult,
  MarketInsight,
  FORECASTING_PARAMS,
  DEFAULT_FORECASTING_OPTIONS
} from '../core/types';

export class ForecastingEngine {
  
  /**
   * Generates skill demand forecasts using specified method
   */
  async generateForecasts(
    skillNames: string[],
    historicalData: Map<string, Array<{ date: string; demand: number; jobCount: number }>>,
    options: ForecastingOptions = DEFAULT_FORECASTING_OPTIONS,
    context?: AnalysisContext
  ): Promise<AnalysisResult<SkillForecast[]>> {
    const startTime = Date.now();
    
    try {
      logger.info('Starting forecast generation', {
        skillCount: skillNames.length,
        method: options.method,
        horizon: options.horizon
      });

      const forecasts: SkillForecast[] = [];
      const insights: MarketInsight[] = [];

      for (const skillName of skillNames) {
        const skillData = historicalData.get(skillName);
        
        if (!skillData || skillData.length < FORECASTING_PARAMS.MIN_HISTORICAL_DATA) {
          logger.warn(`Insufficient data for forecasting ${skillName}`, {
            dataPoints: skillData?.length || 0,
            required: FORECASTING_PARAMS.MIN_HISTORICAL_DATA
          });
          continue;
        }

        const forecast = await this.generateSingleForecast(skillName, skillData, options, context);
        if (forecast) {
          forecasts.push(forecast);
          
          // Generate insights based on forecast
          const skillInsights = this.generateForecastInsights(forecast);
          insights.push(...skillInsights);
        }
      }

      const executionTime = Date.now() - startTime;

      logger.info('Forecast generation completed', {
        forecastsGenerated: forecasts.length,
        insightsGenerated: insights.length,
        executionTime
      });

      return {
        data: forecasts,
        metadata: {
          analysisType: 'skill_forecasting',
          executionTime,
          dataPoints: Array.from(historicalData.values()).reduce((sum, data) => sum + data.length, 0),
          confidence: forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length,
          sources: ['historical_job_data', 'market_trends'],
          timestamp: new Date().toISOString()
        },
        insights
      };

    } catch (error) {
      logger.error('Forecast generation failed', error);
      throw new Error(`Forecast generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generates forecast for a single skill
   */
  private async generateSingleForecast(
    skillName: string,
    historicalData: Array<{ date: string; demand: number; jobCount: number }>,
    options: ForecastingOptions,
    context?: AnalysisContext
  ): Promise<SkillForecast | null> {
    try {
      // Sort data by date
      const sortedData = historicalData.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Apply forecasting method
      let forecast: Partial<SkillForecast>;
      
      switch (options.method) {
        case 'linear':
          forecast = this.linearForecast(skillName, sortedData, options);
          break;
        case 'exponential':
          forecast = this.exponentialForecast(skillName, sortedData, options);
          break;
        case 'arima':
          forecast = this.arimaForecast(skillName, sortedData, options);
          break;
        case 'ensemble':
          forecast = this.ensembleForecast(skillName, sortedData, options);
          break;
        default:
          throw new Error(`Unknown forecasting method: ${options.method}`);
      }

      // Apply seasonal adjustment if enabled
      if (options.includeSeasonality) {
        forecast = this.applySeasonalAdjustment(forecast, sortedData, options.horizon);
      }

      // Apply external factors
      if (options.externalFactors.length > 0) {
        forecast = await this.applyExternalFactors(forecast, options.externalFactors, context);
      }

      // Validate and finalize forecast
      return this.finalizeForecast(forecast as SkillForecast);

    } catch (error) {
      logger.error(`Failed to generate forecast for ${skillName}`, error);
      return null;
    }
  }

  /**
   * Linear regression forecasting
   */
  private linearForecast(
    skillName: string,
    data: Array<{ date: string; demand: number; jobCount: number }>,
    options: ForecastingOptions
  ): Partial<SkillForecast> {
    const demands = data.map(d => d.demand);
    const n = demands.length;
    
    // Calculate linear trend
    const xValues = Array.from({ length: n }, (_, i) => i);
    const yValues = demands;
    
    const { slope, intercept } = this.calculateLinearRegression(xValues, yValues);
    
    // Generate forecasts
    const currentDemand = demands[n - 1];
    const forecast3Months = Math.max(0, intercept + slope * (n + 3));
    const forecast6Months = Math.max(0, intercept + slope * (n + 6));
    const forecast1Year = Math.max(0, intercept + slope * (n + 12));
    
    // Calculate confidence based on R-squared
    const rSquared = this.calculateRSquared(xValues, yValues, slope, intercept);
    const confidence = Math.max(0.3, Math.min(0.95, rSquared));

    return {
      skillName,
      currentDemand,
      forecast3Months,
      forecast6Months,
      forecast1Year,
      confidence,
      factors: ['Linear trend analysis', 'Historical demand pattern'],
      methodology: 'Linear Regression',
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Exponential smoothing forecasting
   */
  private exponentialForecast(
    skillName: string,
    data: Array<{ date: string; demand: number; jobCount: number }>,
    options: ForecastingOptions
  ): Partial<SkillForecast> {
    const demands = data.map(d => d.demand);
    const alpha = 0.3; // Smoothing parameter
    
    // Apply exponential smoothing
    let smoothed = demands[0];
    const smoothedValues = [smoothed];
    
    for (let i = 1; i < demands.length; i++) {
      smoothed = alpha * demands[i] + (1 - alpha) * smoothed;
      smoothedValues.push(smoothed);
    }
    
    // Calculate trend
    const trend = this.calculateExponentialTrend(smoothedValues);
    
    // Generate forecasts
    const currentDemand = demands[demands.length - 1];
    const forecast3Months = Math.max(0, smoothed + trend * 3);
    const forecast6Months = Math.max(0, smoothed + trend * 6);
    const forecast1Year = Math.max(0, smoothed + trend * 12);
    
    // Calculate confidence
    const mse = this.calculateMSE(demands, smoothedValues);
    const confidence = Math.max(0.4, Math.min(0.9, 1 - (mse / Math.max(...demands))));

    return {
      skillName,
      currentDemand,
      forecast3Months,
      forecast6Months,
      forecast1Year,
      confidence,
      factors: ['Exponential smoothing', 'Weighted recent trends'],
      methodology: 'Exponential Smoothing',
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * ARIMA forecasting (simplified implementation)
   */
  private arimaForecast(
    skillName: string,
    data: Array<{ date: string; demand: number; jobCount: number }>,
    options: ForecastingOptions
  ): Partial<SkillForecast> {
    const demands = data.map(d => d.demand);
    
    // Simplified ARIMA implementation
    // In production, this would use a proper ARIMA library
    
    // Calculate differenced series for stationarity
    const diffSeries = this.calculateDifferences(demands);
    
    // Calculate autoregressive component
    const arComponent = this.calculateAR(diffSeries, 1);
    
    // Calculate moving average component
    const maComponent = this.calculateMA(diffSeries, 1);
    
    // Generate forecasts
    const currentDemand = demands[demands.length - 1];
    const baseForecast = currentDemand + arComponent + maComponent;
    
    const forecast3Months = Math.max(0, baseForecast * 1.02);
    const forecast6Months = Math.max(0, baseForecast * 1.05);
    const forecast1Year = Math.max(0, baseForecast * 1.10);
    
    // Calculate confidence
    const residuals = this.calculateResiduals(demands, diffSeries);
    const confidence = Math.max(0.5, Math.min(0.95, 1 - (this.calculateVariance(residuals) / this.calculateVariance(demands))));

    return {
      skillName,
      currentDemand,
      forecast3Months,
      forecast6Months,
      forecast1Year,
      confidence,
      factors: ['Autoregressive model', 'Moving average', 'Differencing'],
      methodology: 'ARIMA',
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Ensemble forecasting (combines multiple methods)
   */
  private ensembleForecast(
    skillName: string,
    data: Array<{ date: string; demand: number; jobCount: number }>,
    options: ForecastingOptions
  ): Partial<SkillForecast> {
    // Generate forecasts using different methods
    const linearForecast = this.linearForecast(skillName, data, options);
    const exponentialForecast = this.exponentialForecast(skillName, data, options);
    const arimaForecast = this.arimaForecast(skillName, data, options);
    
    // Weight forecasts based on their confidence
    const forecasts = [linearForecast, exponentialForecast, arimaForecast];
    const weights = forecasts.map(f => f.confidence || 0.5);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const normalizedWeights = weights.map(w => w / totalWeight);
    
    // Calculate weighted averages
    const currentDemand = data[data.length - 1].demand;
    const forecast3Months = forecasts.reduce((sum, f, i) => 
      sum + (f.forecast3Months || 0) * normalizedWeights[i], 0
    );
    const forecast6Months = forecasts.reduce((sum, f, i) => 
      sum + (f.forecast6Months || 0) * normalizedWeights[i], 0
    );
    const forecast1Year = forecasts.reduce((sum, f, i) => 
      sum + (f.forecast1Year || 0) * normalizedWeights[i], 0
    );
    
    // Calculate ensemble confidence
    const confidence = Math.min(0.95, weights.reduce((sum, w) => sum + w, 0) / weights.length);
    
    // Combine factors from all methods
    const factors = [
      'Ensemble of multiple methods',
      'Linear regression component',
      'Exponential smoothing component',
      'ARIMA component'
    ];

    return {
      skillName,
      currentDemand,
      forecast3Months,
      forecast6Months,
      forecast1Year,
      confidence,
      factors,
      methodology: 'Ensemble (Linear + Exponential + ARIMA)',
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Applies seasonal adjustment to forecasts
   */
  private applySeasonalAdjustment(
    forecast: Partial<SkillForecast>,
    historicalData: Array<{ date: string; demand: number; jobCount: number }>,
    horizon: number
  ): Partial<SkillForecast> {
    if (historicalData.length < 12) {
      return forecast; // Need at least 12 months for seasonal analysis
    }

    // Calculate seasonal factors
    const seasonalFactors = this.calculateSeasonalFactors(historicalData);
    
    // Apply seasonal adjustment to forecasts
    const currentMonth = new Date().getMonth();
    
    const adjust3Months = seasonalFactors[(currentMonth + 3) % 12];
    const adjust6Months = seasonalFactors[(currentMonth + 6) % 12];
    const adjust1Year = seasonalFactors[currentMonth];
    
    return {
      ...forecast,
      forecast3Months: (forecast.forecast3Months || 0) * adjust3Months,
      forecast6Months: (forecast.forecast6Months || 0) * adjust6Months,
      forecast1Year: (forecast.forecast1Year || 0) * adjust1Year,
      seasonalAdjustment: (adjust3Months + adjust6Months + adjust1Year) / 3,
      factors: [...(forecast.factors || []), 'Seasonal adjustment']
    };
  }

  /**
   * Applies external factors to forecasts
   */
  private async applyExternalFactors(
    forecast: Partial<SkillForecast>,
    externalFactors: string[],
    context?: AnalysisContext
  ): Promise<Partial<SkillForecast>> {
    let adjustmentFactor = 1.0;
    const appliedFactors: string[] = [];

    for (const factor of externalFactors) {
      const factorAdjustment = await this.getExternalFactorAdjustment(factor, forecast.skillName!, context);
      adjustmentFactor *= factorAdjustment;
      appliedFactors.push(`${factor} (${(factorAdjustment * 100 - 100).toFixed(1)}%)`);
    }

    return {
      ...forecast,
      forecast3Months: (forecast.forecast3Months || 0) * adjustmentFactor,
      forecast6Months: (forecast.forecast6Months || 0) * adjustmentFactor,
      forecast1Year: (forecast.forecast1Year || 0) * adjustmentFactor,
      factors: [...(forecast.factors || []), ...appliedFactors]
    };
  }

  /**
   * Finalizes and validates forecast
   */
  private finalizeForecast(forecast: SkillForecast): SkillForecast {
    // Ensure all values are non-negative
    forecast.currentDemand = Math.max(0, forecast.currentDemand);
    forecast.forecast3Months = Math.max(0, forecast.forecast3Months);
    forecast.forecast6Months = Math.max(0, forecast.forecast6Months);
    forecast.forecast1Year = Math.max(0, forecast.forecast1Year);
    
    // Ensure confidence is within bounds
    forecast.confidence = Math.max(0.1, Math.min(0.95, forecast.confidence));
    
    // Ensure factors array exists
    if (!forecast.factors) {
      forecast.factors = ['Historical trend analysis'];
    }
    
    return forecast;
  }

  /**
   * Generates insights based on forecast results
   */
  private generateForecastInsights(forecast: SkillForecast): MarketInsight[] {
    const insights: MarketInsight[] = [];
    
    // Growth opportunity insight
    const yearGrowth = (forecast.forecast1Year - forecast.currentDemand) / forecast.currentDemand;
    if (yearGrowth > 0.3) {
      insights.push({
        type: 'opportunity',
        title: `High Growth Potential for ${forecast.skillName}`,
        description: `${forecast.skillName} is projected to grow by ${(yearGrowth * 100).toFixed(1)}% over the next year.`,
        impact: 'high',
        confidence: forecast.confidence,
        affectedSkills: [forecast.skillName],
        timeframe: '1 year',
        actionable: true
      });
    }
    
    // Decline warning
    if (yearGrowth < -0.2) {
      insights.push({
        type: 'threat',
        title: `Declining Demand for ${forecast.skillName}`,
        description: `${forecast.skillName} demand is projected to decline by ${Math.abs(yearGrowth * 100).toFixed(1)}% over the next year.`,
        impact: 'medium',
        confidence: forecast.confidence,
        affectedSkills: [forecast.skillName],
        timeframe: '1 year',
        actionable: true
      });
    }
    
    // Volatility warning
    const volatility = this.calculateForecastVolatility(forecast);
    if (volatility > 0.3) {
      insights.push({
        type: 'anomaly',
        title: `High Volatility in ${forecast.skillName} Forecast`,
        description: `${forecast.skillName} shows high forecast volatility, indicating uncertainty in demand predictions.`,
        impact: 'medium',
        confidence: forecast.confidence * 0.8, // Reduce confidence for volatile forecasts
        affectedSkills: [forecast.skillName],
        timeframe: '6-12 months',
        actionable: false
      });
    }
    
    return insights;
  }

  // Mathematical helper methods

  private calculateLinearRegression(x: number[], y: number[]): { slope: number; intercept: number } {
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  }

  private calculateRSquared(x: number[], y: number[], slope: number, intercept: number): number {
    const yMean = y.reduce((sum, val) => sum + val, 0) / y.length;
    const totalSumSquares = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const residualSumSquares = y.reduce((sum, val, i) => {
      const predicted = slope * x[i] + intercept;
      return sum + Math.pow(val - predicted, 2);
    }, 0);
    
    return 1 - (residualSumSquares / totalSumSquares);
  }

  private calculateExponentialTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const recent = values.slice(-6); // Last 6 values
    const older = values.slice(-12, -6); // Previous 6 values
    
    if (older.length === 0) return 0;
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
    
    return (recentAvg - olderAvg) / 6; // Trend per period
  }

  private calculateMSE(actual: number[], predicted: number[]): number {
    if (actual.length !== predicted.length) return Infinity;
    
    const sumSquaredErrors = actual.reduce((sum, val, i) => {
      return sum + Math.pow(val - predicted[i], 2);
    }, 0);
    
    return sumSquaredErrors / actual.length;
  }

  private calculateDifferences(series: number[]): number[] {
    const differences = [];
    for (let i = 1; i < series.length; i++) {
      differences.push(series[i] - series[i - 1]);
    }
    return differences;
  }

  private calculateAR(series: number[], order: number): number {
    if (series.length < order + 1) return 0;
    
    // Simplified AR(1) calculation
    const recent = series.slice(-order);
    return recent.reduce((sum, val) => sum + val, 0) / recent.length * 0.5;
  }

  private calculateMA(series: number[], order: number): number {
    if (series.length < order) return 0;
    
    // Simplified MA(1) calculation
    const recent = series.slice(-order);
    return recent.reduce((sum, val) => sum + val, 0) / recent.length * 0.3;
  }

  private calculateResiduals(original: number[], processed: number[]): number[] {
    const minLength = Math.min(original.length, processed.length);
    const residuals = [];
    
    for (let i = 0; i < minLength; i++) {
      residuals.push(original[i] - processed[i]);
    }
    
    return residuals;
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const sumSquaredDiffs = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
    
    return sumSquaredDiffs / values.length;
  }

  private calculateSeasonalFactors(data: Array<{ date: string; demand: number }>): number[] {
    const monthlyData: number[][] = Array.from({ length: 12 }, () => []);
    
    // Group data by month
    for (const item of data) {
      const month = new Date(item.date).getMonth();
      monthlyData[month].push(item.demand);
    }
    
    // Calculate average for each month
    const monthlyAverages = monthlyData.map(monthData => {
      if (monthData.length === 0) return 1;
      return monthData.reduce((sum, val) => sum + val, 0) / monthData.length;
    });
    
    // Calculate overall average
    const overallAverage = monthlyAverages.reduce((sum, val) => sum + val, 0) / 12;
    
    // Calculate seasonal factors (ratio to overall average)
    return monthlyAverages.map(avg => avg / overallAverage);
  }

  private async getExternalFactorAdjustment(
    factor: string,
    skillName: string,
    context?: AnalysisContext
  ): Promise<number> {
    // Mock external factor adjustments
    // In production, this would integrate with external data sources
    
    const factorAdjustments: Record<string, number> = {
      'economic_growth': 1.05, // 5% positive impact
      'recession': 0.9, // 10% negative impact
      'technology_adoption': 1.1, // 10% positive impact
      'regulatory_changes': 0.95, // 5% negative impact
      'market_saturation': 0.85, // 15% negative impact
      'emerging_technology': 1.15 // 15% positive impact
    };
    
    return factorAdjustments[factor] || 1.0;
  }

  private calculateForecastVolatility(forecast: SkillForecast): number {
    const values = [
      forecast.currentDemand,
      forecast.forecast3Months,
      forecast.forecast6Months,
      forecast.forecast1Year
    ];
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }
}