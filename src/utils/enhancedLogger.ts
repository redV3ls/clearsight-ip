/**
 * Enhanced Logger with Comprehensive Monitoring
 * Provides detailed logging, performance tracking, and error monitoring
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  analysisId?: string;
  userId?: string;
  requestId?: string;
  duration?: number;
  checkpoint?: string;
  data?: any;
}

export interface PerformanceMarker {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class EnhancedLogger {
  private logLevel: LogLevel;
  private performanceMarkers: Map<string, PerformanceMarker> = new Map();
  private env?: any;
  private metricsCache: Map<string, number> = new Map();

  constructor(level: LogLevel = 'info') {
    this.logLevel = level;
  }

  setEnv(env: any): void {
    this.env = env;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      critical: 4
    };

    return levels[level] >= levels[this.logLevel];
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      level,
      message,
      timestamp,
      ...(data && { ...data })
    };

    return JSON.stringify(logEntry);
  }

  // Store critical logs in KV for monitoring
  private async storeInKV(level: LogLevel, message: string, data?: any): Promise<void> {
    if (!this.env?.CACHE) return;

    try {
      if (level === 'error' || level === 'critical') {
        const key = `log:${level}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
        const logEntry = {
          timestamp: new Date().toISOString(),
          level,
          message,
          data
        };
        
        await this.env.CACHE.put(key, JSON.stringify(logEntry), {
          expirationTtl: 86400 // 24 hours
        });

        // Update error counter
        await this.incrementErrorCounter();
      }

      // Store analysis-specific logs
      if (data?.analysisId) {
        const analysisKey = `log:analysis:${data.analysisId}:${Date.now()}`;
        await this.env.CACHE.put(analysisKey, JSON.stringify({
          timestamp: new Date().toISOString(),
          level,
          message,
          ...data
        }), {
          expirationTtl: 3600 // 1 hour for analysis logs
        });
      }
    } catch (error) {
      console.error('Failed to store log in KV:', error);
    }
  }

  private async incrementErrorCounter(): Promise<void> {
    if (!this.env?.CACHE) return;

    try {
      const dailyKey = `errors:count:${new Date().toISOString().split('T')[0]}`;
      const current = await this.env.CACHE.get(dailyKey);
      const count = current ? parseInt(current) + 1 : 1;
      
      await this.env.CACHE.put(dailyKey, count.toString(), {
        expirationTtl: 604800 // 7 days
      });

      // Alert if error rate is high
      if (count > 100) {
        await this.sendAlert('High error rate detected', { count, date: new Date().toISOString() });
      }
    } catch (error) {
      console.error('Failed to increment error counter:', error);
    }
  }

  private async sendAlert(message: string, data?: any): Promise<void> {
    // In production, this would send to alerting service
    console.error(`🚨 ALERT: ${message}`, data);
    
    if (this.env?.CACHE) {
      const alertKey = `alert:${Date.now()}`;
      await this.env.CACHE.put(alertKey, JSON.stringify({
        message,
        data,
        timestamp: new Date().toISOString()
      }), {
        expirationTtl: 86400
      });
    }
  }

  // Performance tracking
  startTimer(name: string, metadata?: Record<string, any>): void {
    this.performanceMarkers.set(name, {
      name,
      startTime: Date.now(),
      metadata
    });
    
    this.debug(`⏱️ Timer started: ${name}`, metadata);
  }

  endTimer(name: string): number {
    const marker = this.performanceMarkers.get(name);
    if (!marker) {
      this.warn(`Timer ${name} was not started`);
      return 0;
    }

    marker.endTime = Date.now();
    marker.duration = marker.endTime - marker.startTime;
    
    this.info(`⏱️ Timer ended: ${name} (${marker.duration}ms)`, {
      duration: marker.duration,
      ...marker.metadata
    });

    // Alert on slow operations
    if (marker.duration > 30000) {
      this.warn(`⚠️ SLOW OPERATION: ${name} took ${marker.duration}ms`, {
        duration: marker.duration,
        threshold: 30000,
        ...marker.metadata
      });
    }

    if (marker.duration > 50000) {
      this.critical(`🚨 CRITICAL SLOWNESS: ${name} exceeded 50s (${marker.duration}ms)`, {
        duration: marker.duration,
        ...marker.metadata
      });
    }

    this.performanceMarkers.delete(name);
    return marker.duration;
  }

  // Main logging methods
  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, data));
      this.storeInKV('info', message, data);
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
      this.storeInKV('warn', message, data);
    }
  }

  error(message: string, errorOrData?: Error | any, additionalData?: any): void {
    if (this.shouldLog('error')) {
      let data: any;
      
      if (errorOrData instanceof Error) {
        data = {
          error: {
            message: errorOrData.message,
            stack: errorOrData.stack,
            name: errorOrData.name
          },
          ...additionalData
        };
      } else {
        data = errorOrData;
      }
      
      console.error(this.formatMessage('error', message, data));
      this.storeInKV('error', message, data);
    }
  }

  critical(message: string, data?: any): void {
    console.error(this.formatMessage('critical', message, data));
    this.storeInKV('critical', message, data);
    this.sendAlert(message, data);
  }

  // Analysis-specific helpers
  logAnalysisStart(analysisId: string, userId: string, metadata?: Record<string, any>): void {
    this.info(`📊 ANALYSIS STARTED: ${analysisId}`, {
      analysisId,
      userId,
      stage: 'START',
      timestamp: Date.now(),
      ...metadata
    });
    this.startTimer(`analysis:${analysisId}`, { userId, ...metadata });
    this.updateMetric('analysis:started');
  }

  logAnalysisCheckpoint(analysisId: string, checkpoint: string, metadata?: Record<string, any>): void {
    const marker = this.performanceMarkers.get(`analysis:${analysisId}`);
    const elapsed = marker ? Date.now() - marker.startTime : 0;
    
    this.info(`✅ CHECKPOINT [${checkpoint}]: ${analysisId} (${elapsed}ms elapsed)`, {
      analysisId,
      checkpoint,
      elapsed,
      stage: 'CHECKPOINT',
      ...metadata
    });
  }

  logAnalysisComplete(analysisId: string, success: boolean, metadata?: Record<string, any>): void {
    const duration = this.endTimer(`analysis:${analysisId}`);
    
    if (success) {
      this.info(`✨ ANALYSIS COMPLETE: ${analysisId} (${duration}ms)`, {
        analysisId,
        duration,
        stage: 'COMPLETE',
        success: true,
        ...metadata
      });
      this.updateMetric('analysis:success');
    } else {
      this.error(`❌ ANALYSIS FAILED: ${analysisId} (${duration}ms)`, {
        analysisId,
        duration,
        stage: 'FAILED',
        success: false,
        ...metadata
      });
      this.updateMetric('analysis:failed');
    }
    this.updateMetric('analysis:total');
  }

  // Metrics tracking
  private async updateMetric(metricName: string): Promise<void> {
    if (!this.env?.CACHE) return;

    try {
      const key = `metrics:${metricName}`;
      const current = await this.env.CACHE.get(key);
      const count = current ? parseInt(current) + 1 : 1;
      
      await this.env.CACHE.put(key, count.toString(), {
        expirationTtl: 2592000 // 30 days
      });
      
      this.metricsCache.set(metricName, count);
    } catch (error) {
      console.error('Failed to update metric:', error);
    }
  }

  async getMetrics(): Promise<Record<string, any>> {
    const metrics: Record<string, any> = {
      timestamp: new Date().toISOString(),
      activeTimers: Array.from(this.performanceMarkers.keys()),
      cachedMetrics: Object.fromEntries(this.metricsCache)
    };

    if (this.env?.CACHE) {
      try {
        // Get error count
        const dailyKey = `errors:count:${new Date().toISOString().split('T')[0]}`;
        const errorCount = await this.env.CACHE.get(dailyKey);
        metrics.dailyErrors = errorCount ? parseInt(errorCount) : 0;

        // Get analysis metrics
        const analysisTotal = await this.env.CACHE.get('metrics:analysis:total');
        const analysisSuccess = await this.env.CACHE.get('metrics:analysis:success');
        const analysisFailed = await this.env.CACHE.get('metrics:analysis:failed');
        const analysisStarted = await this.env.CACHE.get('metrics:analysis:started');

        metrics.analysis = {
          started: analysisStarted ? parseInt(analysisStarted) : 0,
          total: analysisTotal ? parseInt(analysisTotal) : 0,
          success: analysisSuccess ? parseInt(analysisSuccess) : 0,
          failed: analysisFailed ? parseInt(analysisFailed) : 0,
          inProgress: (analysisStarted ? parseInt(analysisStarted) : 0) - (analysisTotal ? parseInt(analysisTotal) : 0),
          successRate: analysisTotal && analysisSuccess ? 
            ((parseInt(analysisSuccess) / parseInt(analysisTotal)) * 100).toFixed(2) + '%' : 'N/A'
        };
      } catch (error) {
        metrics.error = 'Failed to retrieve some metrics';
      }
    }

    return metrics;
  }

  // Get logs for specific analysis
  async getAnalysisLogs(analysisId: string): Promise<any[]> {
    if (!this.env?.CACHE) return [];

    const logs: any[] = [];
    try {
      // This is simplified - in production you'd use list operations
      // For now, return empty array as KV doesn't support prefix listing easily
      return logs;
    } catch (error) {
      this.error('Failed to retrieve analysis logs', error);
      return [];
    }
  }

  setLevel(level: LogLevel): void {
    this.logLevel = level;
  }
}

// Create singleton logger instance
export const enhancedLogger = new EnhancedLogger('info');

// Export class for testing
export { EnhancedLogger };
