import type { OpenClawConfig } from "./config.js";
import type { WhatsAppConfig } from "./types.js";

export type MergeSectionOptions<T> = {
  unsetOnUndefined?: Array<keyof T>;
};

export function mergeConfigSection<T extends Record<string, unknown>>(
  base: T | undefined,
  patch: Partial<T>,
  options: MergeSectionOptions<T> = {},
): T {
  const next: Record<string, unknown> = base ? Object.assign({}, base) : {};
  const unsetSet: Set<keyof T> | undefined = options.unsetOnUndefined
    ? new Set(options.unsetOnUndefined as Array<keyof T>)
    : undefined;

  for (const key in patch) {
    if (!Object.prototype.hasOwnProperty.call(patch, key)) continue;
    const value = (patch as any)[key] as T[keyof T];

    if (value === undefined) {
      if (unsetSet && unsetSet.has(key as keyof T)) {
        delete next[key];
      }
      continue;
    }

    next[key] = value as unknown;
  }

  return next as T;
}

export function mergeWhatsAppConfig(
  cfg: OpenClawConfig,
  patch: Partial<WhatsAppConfig>,
  options?: MergeSectionOptions<WhatsAppConfig>,
): OpenClawConfig {
  return {
    ...cfg,
    channels: {
      ...cfg.channels,
      whatsapp: mergeConfigSection(cfg.channels?.whatsapp, patch, options),
    },
  };
}
