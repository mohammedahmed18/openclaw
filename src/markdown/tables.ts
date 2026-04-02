import type { MarkdownTableMode } from "../config/types.base.js";
import { markdownToIRWithMeta } from "./ir.js";
import { renderMarkdownWithMarkers } from "./render.js";

const _CACHE_LIMIT = 128;

const _convertMarkdownTablesCache = new Map<string, string>();

const MARKDOWN_STYLE_MARKERS = {
  bold: { open: "**", close: "**" },
  italic: { open: "_", close: "_" },
  strikethrough: { open: "~~", close: "~~" },
  code: { open: "`", close: "`" },
  code_block: { open: "```\n", close: "```" },
} as const;

export function convertMarkdownTables(markdown: string, mode: MarkdownTableMode): string {
  if (!markdown || mode === "off") {
    return markdown;
  }

  const effectiveMode = mode === "block" ? "code" : mode;
  const key = effectiveMode + "\0" + markdown;
  const cached = _convertMarkdownTablesCache.get(key);
  if (cached !== undefined) {
    // Refresh position in LRU (move to end)
    _convertMarkdownTablesCache.delete(key);
    _convertMarkdownTablesCache.set(key, cached);
    return cached;
  }
  const { ir, hasTables } = markdownToIRWithMeta(markdown, {
    linkify: false,
    autolink: false,
    headingStyle: "none",
    blockquotePrefix: "",
    tableMode: effectiveMode,
  });
  if (!hasTables) {
    // Cache result for subsequent identical calls
    _convertMarkdownTablesCache.set(key, markdown);
    if (_convertMarkdownTablesCache.size > _CACHE_LIMIT) {
      const oldest = _convertMarkdownTablesCache.keys().next().value;
      if (oldest !== undefined) {
        _convertMarkdownTablesCache.delete(oldest);
      }
    }
    return markdown;
  }

  const result = renderMarkdownWithMarkers(ir, {
    styleMarkers: MARKDOWN_STYLE_MARKERS,
    escapeText: (text) => text,
    buildLink: (link, text) => {
      const href = link.href.trim();
      if (!href) {
        return null;
      }
      const label = text.slice(link.start, link.end);
      if (!label) {
        return null;
      }
      return { start: link.start, end: link.end, open: "[", close: `](${href})` };
    },
  });

  _convertMarkdownTablesCache.set(key, result);
  if (_convertMarkdownTablesCache.size > _CACHE_LIMIT) {
    const oldest = _convertMarkdownTablesCache.keys().next().value;
    if (oldest !== undefined) {
      _convertMarkdownTablesCache.delete(oldest);
    }
  }

  return result;
}
