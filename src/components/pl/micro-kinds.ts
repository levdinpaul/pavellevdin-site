export type MicroKind = 'browser' | 'serp' | 'log' | 'chat' | 'telegram' | 'containers' | 'social';

/** Какая micro-UI у какой услуги (индекс в pl.services.items). */
export const SERVICE_MICRO: (MicroKind | null)[] = ['browser', 'serp', 'log', 'chat', 'social', 'telegram', 'containers', null];
