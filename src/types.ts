/**
 * Type definitions for VengeanceUI MCP Server
 */

export interface ComponentMetadata {
  name: string;
  category: string;
  description: string;
  sourceUrl: string;
  demoUrl?: string;
  tags: string[];
  code: string;
  dependencies?: string[];
  path?: string;
  size?: number;
}

export interface ComponentSummary {
  name: string;
  category: string;
  description: string;
  tags: string[];
  sourceUrl: string;
}

export interface GitHubContentItem {
  name: string;
  path: string;
  type: string;
  download_url: string | null;
  html_url: string;
  size?: number;
}

export interface CategoryInfo {
  name: string;
  count: number;
  description: string;
}

export interface SearchResult {
  component: ComponentMetadata;
  score: number;
  matchedFields: string[];
}
