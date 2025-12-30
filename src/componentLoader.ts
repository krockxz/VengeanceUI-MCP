/**
 * Component Loader - Fetches and parses VengeanceUI components from GitHub
 */

import axios from "axios";
import type { ComponentMetadata, GitHubContentItem, CategoryInfo } from "./types.js";

const VENGEANCEUI_REPO = "Ashutoshx7/VengeanceUI";
const GITHUB_API_BASE = "https://api.github.com";

/**
 * Fetch all components from the VengeanceUI GitHub repository
 */
export async function loadComponentsFromGitHub(): Promise<ComponentMetadata[]> {
  const components: ComponentMetadata[] = [];

  try {
    // List of directories to search for components
    const searchPaths = ["registry/new-york", "src/components"];

    for (const path of searchPaths) {
      try {
        const dirComponents = await fetchComponentsFromDirectory(path);
        components.push(...dirComponents);
      } catch (error) {
        // Directory might not exist, continue to next path
        console.error(`Failed to load from ${path}:`, error);
      }
    }

    // If no components found in specific directories, try root
    if (components.length === 0) {
      const rootComponents = await fetchComponentsFromDirectory("");
      components.push(...rootComponents);
    }

    return components;
  } catch (error) {
    console.error("Failed to load components from GitHub:", error);
    return [];
  }
}

/**
 * Fetch components from a specific directory in the repository
 */
async function fetchComponentsFromDirectory(path: string): Promise<ComponentMetadata[]> {
  const components: ComponentMetadata[] = [];
  const url = `${GITHUB_API_BASE}/repos/${VENGEANCEUI_REPO}/contents/${path}`;

  const response = await axios.get<GitHubContentItem[]>(url, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: process.env.GITHUB_TOKEN ? `token ${process.env.GITHUB_TOKEN}` : undefined,
    } as Record<string, string>,
  });

  for (const item of response.data) {
    // Skip non-TS/TSX files and directories that aren't components
    if (item.type === "dir") {
      // Recursively fetch subdirectories
      try {
        const subComponents = await fetchComponentsFromDirectory(item.path);
        components.push(...subComponents);
      } catch {
        // Skip if directory is inaccessible
      }
      continue;
    }

    if (item.type !== "file") continue;

    const isComponentFile =
      item.name.endsWith(".tsx") ||
      item.name.endsWith(".ts") ||
      item.name.endsWith(".jsx") ||
      item.name.endsWith(".js");

    // Skip test files, stories, and config files
    if (
      !isComponentFile ||
      item.name.includes(".test.") ||
      item.name.includes(".spec.") ||
      item.name.includes(".stories.") ||
      item.name.startsWith("_")
    ) {
      continue;
    }

    try {
      const component = await fetchComponentMetadata(item);
      if (component) {
        components.push(component);
      }
    } catch (error) {
      console.error(`Failed to load component ${item.name}:`, error);
    }
  }

  return components;
}

/**
 * Fetch metadata for a single component
 */
async function fetchComponentMetadata(item: GitHubContentItem): Promise<ComponentMetadata | null> {
  if (!item.download_url) return null;

  const codeResponse = await axios.get(item.download_url, {
    headers: {
      Authorization: process.env.GITHUB_TOKEN ? `token ${process.env.GITHUB_TOKEN}` : undefined,
    } as Record<string, string>,
  });

  const code = codeResponse.data;
  const componentName = extractComponentName(item.name);

  return {
    name: componentName,
    category: extractCategory(componentName, code),
    description: extractDescription(code, componentName),
    sourceUrl: item.html_url,
    tags: extractTags(code),
    code: code,
    dependencies: extractDependencies(code),
    path: item.path,
    size: item.size,
  };
}

/**
 * Extract component name from filename
 */
function extractComponentName(filename: string): string {
  return filename.replace(/\.(tsx?|jsx?)$/, "");
}

/**
 * Extract category from component name and code
 */
function extractCategory(componentName: string, code: string): string {
  // Category mapping based on component naming patterns
  const categoryMap: Record<string, string> = {
    button: "Buttons",
    btn: "Buttons",
    card: "Cards",
    input: "Forms",
    form: "Forms",
    select: "Forms",
    checkbox: "Forms",
    radio: "Forms",
    toggle: "Forms",
    switch: "Forms",
    nav: "Navigation",
    header: "Navigation",
    footer: "Navigation",
    sidebar: "Navigation",
    menu: "Navigation",
    modal: "Overlays",
    dialog: "Overlays",
    popover: "Overlays",
    tooltip: "Overlays",
    dropdown: "Overlays",
    sheet: "Overlays",
    drawer: "Overlays",
    badge: "Data Display",
    avatar: "Data Display",
    list: "Data Display",
    table: "Data Display",
    tabs: "Navigation",
    accordion: "Data Display",
    carousel: "Data Display",
    slider: "Forms",
    progress: "Feedback",
    spinner: "Feedback",
    loader: "Feedback",
    skeleton: "Feedback",
    alert: "Feedback",
    toast: "Feedback",
    notification: "Feedback",
    layout: "Layout",
    container: "Layout",
    grid: "Layout",
    flex: "Layout",
    section: "Layout",
    divider: "Layout",
    separator: "Layout",
    space: "Layout",
    typography: "Typography",
    text: "Typography",
    heading: "Typography",
    title: "Typography",
    label: "Typography",
    icon: "Icons",
    image: "Media",
    video: "Media",
    animation: "Animation",
    transition: "Animation",
    effect: "Animation",
    gradient: "Styles",
    theme: "Styles",
    chart: "Data Visualization",
    graph: "Data Visualization",
  };

  const nameLower = componentName.toLowerCase();

  for (const [key, category] of Object.entries(categoryMap)) {
    if (nameLower.includes(key)) {
      return category;
    }
  }

  // Try to infer from code structure
  if (code.includes("Button") || code.includes("btn")) return "Buttons";
  if (code.includes("Card")) return "Cards";
  if (code.includes("Input") || code.includes("Form")) return "Forms";
  if (code.includes("Modal") || code.includes("Dialog")) return "Overlays";
  if (code.includes("Nav")) return "Navigation";

  return "Components";
}

/**
 * Extract description from JSDoc comments or generate one
 */
function extractDescription(code: string, componentName: string): string {
  // Look for JSDoc comments at the top of the file
  const jsdocMatch = code.match(/\/\*\*\s*\n([^*]|\*[^/])*\*\//);
  if (jsdocMatch) {
    const comment = jsdocMatch[0];
    const descriptionMatch = comment.match(/\*\s*([^@\n]+)/);
    if (descriptionMatch) {
      return descriptionMatch[1].trim();
    }
  }

  // Look for regular comments
  const commentMatch = code.match(/\/\/\s*(.+)/);
  if (commentMatch) {
    return commentMatch[1].trim();
  }

  // Generate description based on component name
  return `${componentName} component from VengeanceUI`;
}

/**
 * Extract tags from code characteristics
 */
function extractTags(code: string): string[] {
  const tags: Set<string> = new Set();

  // Animation-related tags
  if (code.includes("@keyframes") || code.includes("animation")) tags.add("animation");
  if (code.includes("transition") || code.includes("transform")) tags.add("animated");

  // Interaction tags
  if (code.includes("onClick") || code.includes("onChange") || code.includes("onHover")) {
    tags.add("interactive");
  }

  // Style tags
  if (code.includes("gradient")) tags.add("gradient");
  if (code.includes("Tailwind") || code.includes("className")) tags.add("tailwind");
  if (code.includes("styled")) tags.add("styled-components");

  // Layout tags
  if (code.includes("flex") || code.includes("grid")) tags.add("layout");
  if (code.includes("responsive") || code.includes("md:") || code.includes("lg:")) {
    tags.add("responsive");
  }

  // Feature tags
  if (code.includes("useRef") || code.includes("useEffect") || code.includes("useState")) {
    tags.add("hooks");
  }
  if (code.includes("forwardRef")) tags.add("composable");
  if (code.includes("children")) tags.add("compound");

  return Array.from(tags);
}

/**
 * Extract dependencies from import statements
 */
function extractDependencies(code: string): string[] {
  const dependencies: Set<string> = new Set();

  // Match ES6 imports
  const importMatches = code.matchAll(
    /import\s+.*?\s+from\s+['"](@?[\w/-]+)['"]/g
  );

  for (const match of importMatches) {
    const dependency = match[1];

    // Skip relative imports and built-in Node modules
    if (!dependency.startsWith(".") && !dependency.startsWith("node:")) {
      dependencies.add(dependency);
    }
  }

  // Also check for require() statements
  const requireMatches = code.matchAll(/require\(['"](@?[\w/-]+)['"]\)/g);

  for (const match of requireMatches) {
    const dependency = match[1];
    if (!dependency.startsWith(".") && !dependency.startsWith("node:")) {
      dependencies.add(dependency);
    }
  }

  return Array.from(dependencies);
}

/**
 * Get all unique categories from components
 */
export function getCategories(components: ComponentMetadata[]): CategoryInfo[] {
  const categoryMap = new Map<string, ComponentMetadata[]>();

  for (const component of components) {
    if (!categoryMap.has(component.category)) {
      categoryMap.set(component.category, []);
    }
    categoryMap.get(component.category)!.push(component);
  }

  return Array.from(categoryMap.entries()).map(([name, components]) => ({
    name,
    count: components.length,
    description: `${components.length} ${name.toLowerCase()} component${components.length !== 1 ? "s" : ""}`,
  }));
}
