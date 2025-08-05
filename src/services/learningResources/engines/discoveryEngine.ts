/**
 * Resource Discovery Engine
 * 
 * Handles resource discovery across multiple providers with intelligent
 * caching, filtering, and aggregation strategies.
 */

import { logger } from '../../../utils/logger';
import { 
  LearningResource, 
  ResourceProvider, 
  ResourceFilter, 
  ResourceSearchQuery,
  ResourceSearchResult,
  ProviderSearchOptions,
  DiscoveryStrategy,
  CacheEntry,
  ProviderMetrics
} from '../core/types';

export class ResourceDiscoveryEngine {
  private providers: Map<string, ResourceProvider> = new Map();
  private resourceCache: Map<string, CacheEntry<LearningResource[]>> = new Map();
  private providerMetrics: Map<string, ProviderMetrics> = new Map();
  private readonly DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.initializeProviders();
  }

  /**
   * Discovers resources across all providers based on search query
   */
  async discoverResources(
    query: ResourceSearchQuery,
    strategy: DiscoveryStrategy = 'comprehensive',
    options: ProviderSearchOptions = {}
  ): Promise<ResourceSearchResult> {
    const startTime = Date.now();
    
    try {
      logger.info('Starting resource discovery', { 
        strategy,
        skillNames: query.skillNames,
        textQuery: query.textQuery,
        maxResults: query.maxResults
      });

      // Select providers based on strategy
      const selectedProviders = this.selectProviders(strategy, query);
      
      // Gather resources from selected providers
      const allResources = await this.gatherFromProviders(
        selectedProviders,
        query,
        options
      );

      // Remove duplicates and apply filters
      const filteredResources = this.processDiscoveredResources(
        allResources,
        query.filters
      );

      // Limit results if specified
      const finalResources = query.maxResults 
        ? filteredResources.slice(0, query.maxResults)
        : filteredResources;

      const searchTime = Date.now() - startTime;
      const cacheHit = this.wasCacheUsed(selectedProviders, query);

      const result: ResourceSearchResult = {
        resources: finalResources,
        totalFound: filteredResources.length,
        searchTime,
        providers: selectedProviders.map(p => p.name),
        cacheHit
      };

      logger.info('Resource discovery completed', {
        totalFound: result.totalFound,
        returned: result.resources.length,
        searchTime: result.searchTime,
        providers: result.providers.length,
        cacheHit: result.cacheHit
      });

      return result;

    } catch (error) {
      logger.error('Resource discovery failed', error);
      throw new Error(`Resource discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Searches for resources by skill names
   */
  async searchBySkills(
    skillNames: string[],
    filters: ResourceFilter = {},
    options: ProviderSearchOptions = {}
  ): Promise<LearningResource[]> {
    const query: ResourceSearchQuery = {
      skillNames,
      filters,
      userPreferences: {},
      maxResults: options.maxResults
    };

    const result = await this.discoverResources(query, 'comprehensive', options);
    return result.resources;
  }

  /**
   * Searches for resources by text query
   */
  async searchByText(
    textQuery: string,
    filters: ResourceFilter = {},
    options: ProviderSearchOptions = {}
  ): Promise<LearningResource[]> {
    const query: ResourceSearchQuery = {
      textQuery,
      filters,
      userPreferences: {},
      maxResults: options.maxResults
    };

    const result = await this.discoverResources(query, 'fast', options);
    return result.resources;
  }

  /**
   * Gets trending resources for a category or skill
   */
  async getTrendingResources(
    category?: string,
    skillName?: string,
    limit: number = 20
  ): Promise<LearningResource[]> {
    const filters: ResourceFilter = {};
    
    if (category) {
      filters.categories = [category];
    }
    
    if (skillName) {
      filters.skillNames = [skillName];
    }

    const query: ResourceSearchQuery = {
      filters,
      userPreferences: {},
      maxResults: limit
    };

    const result = await this.discoverResources(query, 'trending');
    
    // Sort by popularity and recency
    return result.resources.sort((a, b) => {
      const scoreA = a.popularity * 0.7 + this.getRecencyScore(a.lastUpdated) * 0.3;
      const scoreB = b.popularity * 0.7 + this.getRecencyScore(b.lastUpdated) * 0.3;
      return scoreB - scoreA;
    });
  }

  /**
   * Selects providers based on discovery strategy
   */
  private selectProviders(
    strategy: DiscoveryStrategy,
    query: ResourceSearchQuery
  ): ResourceProvider[] {
    const allProviders = Array.from(this.providers.values());

    switch (strategy) {
      case 'fast':
        // Select top 3 most reliable providers
        return allProviders
          .sort((a, b) => this.getProviderReliability(b.name) - this.getProviderReliability(a.name))
          .slice(0, 3);

      case 'budget-conscious':
        // Prioritize providers with free content
        return allProviders.filter(p => 
          p.name === 'youtube' || p.name === 'github' || p.name === 'documentation'
        );

      case 'quality-focused':
        // Select premium providers with high-quality content
        return allProviders.filter(p => 
          ['coursera', 'pluralsight', 'edx', 'linkedin'].includes(p.name)
        );

      case 'trending':
        // Select providers good for discovering trending content
        return allProviders.filter(p => 
          ['udemy', 'youtube', 'medium', 'github'].includes(p.name)
        );

      case 'personalized':
        // Select based on user preferences
        if (query.userPreferences.preferredProviders?.length) {
          return allProviders.filter(p => 
            query.userPreferences.preferredProviders!.includes(p.name)
          );
        }
        return allProviders;

      case 'comprehensive':
      default:
        return allProviders;
    }
  }

  /**
   * Gathers resources from selected providers
   */
  private async gatherFromProviders(
    providers: ResourceProvider[],
    query: ResourceSearchQuery,
    options: ProviderSearchOptions
  ): Promise<LearningResource[]> {
    const allResources: LearningResource[] = [];
    const promises: Promise<LearningResource[]>[] = [];

    for (const provider of providers) {
      const promise = this.fetchFromProvider(provider, query, options)
        .catch(error => {
          logger.warn(`Failed to fetch from provider ${provider.name}`, error);
          this.updateProviderMetrics(provider.name, false);
          return []; // Return empty array on failure
        });
      
      promises.push(promise);
    }

    const results = await Promise.allSettled(promises);
    
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allResources.push(...result.value);
      }
    }

    return allResources;
  }

  /**
   * Fetches resources from a specific provider
   */
  private async fetchFromProvider(
    provider: ResourceProvider,
    query: ResourceSearchQuery,
    options: ProviderSearchOptions
  ): Promise<LearningResource[]> {
    const startTime = Date.now();
    
    try {
      // Check cache first
      if (options.useCache !== false) {
        const cacheKey = this.generateCacheKey(provider.name, query);
        const cached = this.getFromCache(cacheKey);
        
        if (cached) {
          logger.debug(`Cache hit for provider ${provider.name}`);
          return cached;
        }
      }

      // Fetch from provider (mock implementation for now)
      const resources = await this.fetchFromProviderAPI(provider, query);
      
      // Cache the results
      if (options.useCache !== false) {
        const cacheKey = this.generateCacheKey(provider.name, query);
        this.cacheResults(cacheKey, resources, options.cacheExpiry);
      }

      // Update metrics
      this.updateProviderMetrics(provider.name, true, Date.now() - startTime);
      
      return resources;

    } catch (error) {
      this.updateProviderMetrics(provider.name, false);
      throw error;
    }
  }

  /**
   * Fetches resources from provider API (mock implementation)
   */
  private async fetchFromProviderAPI(
    provider: ResourceProvider,
    query: ResourceSearchQuery
  ): Promise<LearningResource[]> {
    // This would make actual API calls in production
    // For now, return mock data
    return this.getMockResourcesForProvider(provider, query);
  }

  /**
   * Processes discovered resources by removing duplicates and applying filters
   */
  private processDiscoveredResources(
    resources: LearningResource[],
    filters: ResourceFilter
  ): LearningResource[] {
    // Remove duplicates
    const uniqueResources = this.removeDuplicates(resources);
    
    // Apply filters
    return this.applyFilters(uniqueResources, filters);
  }

  /**
   * Removes duplicate resources based on URL and title similarity
   */
  private removeDuplicates(resources: LearningResource[]): LearningResource[] {
    const seen = new Set<string>();
    const unique: LearningResource[] = [];

    for (const resource of resources) {
      const key = `${resource.url}|${resource.title.toLowerCase()}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(resource);
      }
    }

    return unique;
  }

  /**
   * Applies filters to resource list
   */
  private applyFilters(resources: LearningResource[], filters: ResourceFilter): LearningResource[] {
    return resources.filter(resource => {
      // Skill name filter
      if (filters.skillNames?.length && 
          !filters.skillNames.some(skill => 
            resource.skillName.toLowerCase().includes(skill.toLowerCase())
          )) {
        return false;
      }

      // Category filter
      if (filters.categories?.length && 
          !filters.categories.includes(resource.skillCategory)) {
        return false;
      }

      // Type filter
      if (filters.types?.length && !filters.types.includes(resource.type)) {
        return false;
      }

      // Level filter
      if (filters.levels?.length && !filters.levels.includes(resource.level)) {
        return false;
      }

      // Price filter
      if (filters.maxPrice !== undefined && resource.price > filters.maxPrice) {
        return false;
      }

      // Free only filter
      if (filters.freeOnly && resource.price > 0) {
        return false;
      }

      // Rating filter
      if (filters.minRating !== undefined && resource.rating < filters.minRating) {
        return false;
      }

      // Language filter
      if (filters.languages?.length && !filters.languages.includes(resource.language)) {
        return false;
      }

      // Format filter
      if (filters.formats?.length && !filters.formats.includes(resource.format)) {
        return false;
      }

      // Duration filter
      if (filters.maxDuration !== undefined && resource.duration > filters.maxDuration) {
        return false;
      }

      // Provider filter
      if (filters.providers?.length && !filters.providers.includes(resource.provider)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Cache management methods
   */
  private generateCacheKey(providerName: string, query: ResourceSearchQuery): string {
    const keyParts = [
      providerName,
      query.skillNames?.join(',') || '',
      query.textQuery || '',
      JSON.stringify(query.filters)
    ];
    
    return keyParts.join('|');
  }

  private getFromCache(cacheKey: string): LearningResource[] | null {
    const entry = this.resourceCache.get(cacheKey);
    
    if (entry && Date.now() < entry.expiry) {
      return entry.data;
    }
    
    // Remove expired entry
    if (entry) {
      this.resourceCache.delete(cacheKey);
    }
    
    return null;
  }

  private cacheResults(
    cacheKey: string, 
    resources: LearningResource[], 
    customExpiry?: number
  ): void {
    const expiry = Date.now() + (customExpiry || this.DEFAULT_CACHE_DURATION);
    
    const entry: CacheEntry<LearningResource[]> = {
      data: resources,
      timestamp: Date.now(),
      expiry,
      key: cacheKey
    };
    
    this.resourceCache.set(cacheKey, entry);
  }

  private wasCacheUsed(providers: ResourceProvider[], query: ResourceSearchQuery): boolean {
    return providers.some(provider => {
      const cacheKey = this.generateCacheKey(provider.name, query);
      return this.resourceCache.has(cacheKey);
    });
  }

  /**
   * Provider management methods
   */
  private initializeProviders(): void {
    // Initialize with common learning resource providers
    const providers: ResourceProvider[] = [
      {
        name: 'coursera',
        baseUrl: 'https://api.coursera.org',
        rateLimit: 100,
        supportedTypes: ['course', 'certification'],
        searchCapabilities: {
          bySkill: true,
          byLevel: true,
          byDuration: true,
          byPrice: true,
          byRating: true
        }
      },
      {
        name: 'udemy',
        baseUrl: 'https://api.udemy.com',
        rateLimit: 200,
        supportedTypes: ['course', 'tutorial'],
        searchCapabilities: {
          bySkill: true,
          byLevel: true,
          byDuration: true,
          byPrice: true,
          byRating: true
        }
      },
      {
        name: 'youtube',
        baseUrl: 'https://www.googleapis.com/youtube/v3',
        rateLimit: 1000,
        supportedTypes: ['video', 'tutorial'],
        searchCapabilities: {
          bySkill: true,
          byLevel: false,
          byDuration: true,
          byPrice: false,
          byRating: true
        }
      },
      {
        name: 'github',
        baseUrl: 'https://api.github.com',
        rateLimit: 5000,
        supportedTypes: ['practice', 'documentation'],
        searchCapabilities: {
          bySkill: true,
          byLevel: false,
          byDuration: false,
          byPrice: false,
          byRating: true
        }
      }
    ];

    for (const provider of providers) {
      this.providers.set(provider.name, provider);
      this.initializeProviderMetrics(provider.name);
    }

    logger.info(`Initialized ${providers.length} resource providers`);
  }

  private initializeProviderMetrics(providerName: string): void {
    this.providerMetrics.set(providerName, {
      name: providerName,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastRequestTime: 0,
      rateLimitHits: 0
    });
  }

  private updateProviderMetrics(
    providerName: string, 
    success: boolean, 
    responseTime?: number
  ): void {
    const metrics = this.providerMetrics.get(providerName);
    if (!metrics) return;

    metrics.totalRequests++;
    metrics.lastRequestTime = Date.now();

    if (success) {
      metrics.successfulRequests++;
      if (responseTime) {
        metrics.averageResponseTime = 
          (metrics.averageResponseTime * (metrics.successfulRequests - 1) + responseTime) / 
          metrics.successfulRequests;
      }
    } else {
      metrics.failedRequests++;
    }
  }

  private getProviderReliability(providerName: string): number {
    const metrics = this.providerMetrics.get(providerName);
    if (!metrics || metrics.totalRequests === 0) return 0.5;

    return metrics.successfulRequests / metrics.totalRequests;
  }

  private getRecencyScore(lastUpdated: string): number {
    const updateDate = new Date(lastUpdated);
    const now = new Date();
    const daysDiff = (now.getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Score decreases with age, 1.0 for today, 0.5 for 1 year old
    return Math.max(0, 1 - (daysDiff / 365));
  }

  /**
   * Mock data generation for development
   */
  private getMockResourcesForProvider(
    provider: ResourceProvider,
    query: ResourceSearchQuery
  ): LearningResource[] {
    const resources: LearningResource[] = [];
    const skillNames = query.skillNames || ['JavaScript']; // Default skill

    for (const skillName of skillNames) {
      const mockResources = this.generateMockResourcesForSkill(skillName, provider.name);
      resources.push(...mockResources);
    }

    return resources.slice(0, 10); // Limit to 10 per provider
  }

  private generateMockResourcesForSkill(skillName: string, providerName: string): LearningResource[] {
    const resources: LearningResource[] = [];
    const types = this.providers.get(providerName)?.supportedTypes || ['course'];

    for (let i = 0; i < 3; i++) {
      const type = types[i % types.length];
      
      resources.push({
        id: `${providerName}-${skillName}-${i}`,
        title: `${skillName} ${type} from ${providerName}`,
        description: `Learn ${skillName} with this comprehensive ${type}`,
        provider: providerName,
        type,
        url: `https://${providerName}.com/${skillName.toLowerCase()}-${type}-${i}`,
        skillName,
        skillCategory: this.getSkillCategory(skillName),
        level: ['beginner', 'intermediate', 'advanced'][i % 3] as any,
        duration: 10 + (i * 5),
        rating: 4.0 + (Math.random() * 1.0),
        reviewCount: Math.floor(Math.random() * 1000) + 100,
        price: providerName === 'youtube' ? 0 : Math.floor(Math.random() * 200),
        currency: 'USD',
        language: 'en',
        format: 'online',
        prerequisites: i > 0 ? [`Basic ${skillName}`] : [],
        learningObjectives: [`Master ${skillName} fundamentals`, `Build real projects`],
        tags: [skillName.toLowerCase(), type, providerName],
        lastUpdated: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        popularity: Math.random()
      });
    }

    return resources;
  }

  private getSkillCategory(skillName: string): string {
    const skill = skillName.toLowerCase();
    
    if (['javascript', 'python', 'java', 'c++', 'c#'].includes(skill)) {
      return 'Programming';
    }
    if (['react', 'angular', 'vue', 'html', 'css'].includes(skill)) {
      return 'Web Development';
    }
    if (['aws', 'azure', 'gcp', 'docker', 'kubernetes'].includes(skill)) {
      return 'Cloud Computing';
    }
    
    return 'Technology';
  }

  /**
   * Public utility methods
   */
  getProviderMetrics(): Map<string, ProviderMetrics> {
    return new Map(this.providerMetrics);
  }

  clearCache(): void {
    this.resourceCache.clear();
    logger.info('Resource cache cleared');
  }

  getCacheStats(): { size: number; hitRate: number } {
    const size = this.resourceCache.size;
    const totalRequests = Array.from(this.providerMetrics.values())
      .reduce((sum, metrics) => sum + metrics.totalRequests, 0);
    
    // Simplified hit rate calculation
    const hitRate = totalRequests > 0 ? Math.min(0.3, size / totalRequests) : 0;
    
    return { size, hitRate };
  }
}