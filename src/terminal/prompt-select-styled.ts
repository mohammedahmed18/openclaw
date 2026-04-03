import { select } from "@clack/prompts";
import { stylePromptHint, stylePromptMessage } from "./prompt-style.js";

export function selectStyled<T>(params: Parameters<typeof select<T>>[0]) {
  const message = stylePromptMessage(params.message);

  const opts = params.options;
  let options = opts;

  if (opts && opts.length) {
    // Check whether any option actually needs hint styling to avoid an unnecessary allocation
    let needMap = false;
    for (let i = 0, len = opts.length; i < len; i++) {
      if (opts[i].hint !== undefined) {
        needMap = true;
        break;
      }
    }

    if (needMap) {
      // Build a new array in a single pass, reusing original option objects when possible
      const out = new Array(opts.length);
      for (let i = 0, len = opts.length; i < len; i++) {
        const opt = opts[i];
        const hint = opt.hint;
        if (hint === undefined) {
          out[i] = opt;
        } else {
          out[i] = { ...opt, hint: stylePromptHint(hint) };
        }
      }
      options = out;
    }
  }

  return select({
    ...params,
    message,
    options,
  });
}
