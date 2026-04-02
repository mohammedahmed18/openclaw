import { isRich, theme } from "./theme.js";

export const stylePromptMessage = (message: string): string =>
  isRich() ? theme.accent(message) : message;

export const stylePromptTitle = (title?: string): string | undefined =>
  title && isRich() ? theme.heading(title) : title;

export const stylePromptHint = (hint?: string): string | undefined =>
  {
      if (!hint) return hint;
      return isRich() ? theme.muted(hint) : hint;
    };
