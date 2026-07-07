import type { ExplorationBreadcrumb, ExplorationState } from "./types.ts";

const MAX_BREADCRUMBS = 15;

export function addBreadcrumb(
  state: ExplorationState,
  nodeId: string,
  label: string,
  domain: string,
): ExplorationState {
  if (!state.selectedNodeId || state.selectedNodeId === nodeId) {
    return { ...state, selectedNodeId: nodeId };
  }

  const breadcrumbs = [...state.breadcrumbs];
  breadcrumbs.push({
    nodeId: state.selectedNodeId,
    label,
    domain,
    timestamp: Date.now(),
    selectionIndex: breadcrumbs.length,
  });

  if (breadcrumbs.length > MAX_BREADCRUMBS) {
    breadcrumbs.splice(0, breadcrumbs.length - MAX_BREADCRUMBS);
  }

  return {
    ...state,
    selectedNodeId: nodeId,
    breadcrumbs,
  };
}

export function getRecentBreadcrumbs(breadcrumbs: readonly ExplorationBreadcrumb[], count: number): readonly ExplorationBreadcrumb[] {
  return breadcrumbs.slice(-count);
}

export function getBreadcrumbsByDomain(breadcrumbs: readonly ExplorationBreadcrumb[], domain: string): readonly ExplorationBreadcrumb[] {
  return breadcrumbs.filter((b) => b.domain === domain);
}

export function formatBreadcrumbTrail(breadcrumbs: readonly ExplorationBreadcrumb[]): string {
  if (breadcrumbs.length === 0) return "";
  return breadcrumbs.map((b) => b.label).join(" → ");
}

export function getExplorationPath(breadcrumbs: readonly ExplorationBreadcrumb[]): string[] {
  return breadcrumbs.map((b) => b.nodeId);
}

export function getDomainTransitionCount(breadcrumbs: readonly ExplorationBreadcrumb[]): number {
  let transitions = 0;
  for (let i = 1; i < breadcrumbs.length; i++) {
    if (breadcrumbs[i].domain !== breadcrumbs[i - 1].domain) {
      transitions += 1;
    }
  }
  return transitions;
}

export function getExplorationDuration(breadcrumbs: readonly ExplorationBreadcrumb[]): number {
  if (breadcrumbs.length < 2) return 0;
  const first = breadcrumbs[0].timestamp;
  const last = breadcrumbs[breadcrumbs.length - 1].timestamp;
  return last - first;
}
