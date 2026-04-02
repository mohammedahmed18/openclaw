export type OutboundMediaReadFile = (filePath: string) => Promise<Buffer>;

export type OutboundMediaAccess = {
  localRoots?: readonly string[];
  readFile?: OutboundMediaReadFile;
  /** Agent workspace directory for resolving relative MEDIA: paths. */
  workspaceDir?: string;
};

export type OutboundMediaLoadParams = {
  maxBytes?: number;
  mediaAccess?: OutboundMediaAccess;
  mediaLocalRoots?: readonly string[];
  mediaReadFile?: OutboundMediaReadFile;
  optimizeImages?: boolean;
  /** Agent workspace directory for resolving relative MEDIA: paths. */
  workspaceDir?: string;
};

export type OutboundMediaLoadOptions = {
  maxBytes?: number;
  localRoots?: readonly string[] | "any";
  readFile?: (filePath: string) => Promise<Buffer>;
  hostReadCapability?: boolean;
  optimizeImages?: boolean;
  /** Agent workspace directory for resolving relative MEDIA: paths. */
  workspaceDir?: string;
};

export function resolveOutboundMediaLocalRoots(
  mediaLocalRoots?: readonly string[],
): readonly string[] | undefined {
  return mediaLocalRoots && mediaLocalRoots.length > 0 ? mediaLocalRoots : undefined;
}

export function resolveOutboundMediaAccess(
  params: {
    mediaAccess?: OutboundMediaAccess;
    mediaLocalRoots?: readonly string[];
    mediaReadFile?: OutboundMediaReadFile;
  } = {},
): OutboundMediaAccess | undefined {
  const ma = params.mediaAccess;
  const rootsCandidate = ma?.localRoots ?? params.mediaLocalRoots;
  let localRoots: readonly string[] | undefined;
  if (rootsCandidate && rootsCandidate.length > 0) {
    localRoots = rootsCandidate;
  }

  const readFile = ma?.readFile ?? params.mediaReadFile;
  const workspaceDir = ma?.workspaceDir;

  if (!localRoots && !readFile && !workspaceDir) {
    return undefined;
  }

  const out: OutboundMediaAccess = {};
  if (localRoots) out.localRoots = localRoots;
  if (readFile) out.readFile = readFile;
  if (workspaceDir) out.workspaceDir = workspaceDir;
  return out;
}

export function buildOutboundMediaLoadOptions(
  params: OutboundMediaLoadParams = {},
): OutboundMediaLoadOptions {
  const mediaAccess = resolveOutboundMediaAccess(params);
  const workspaceDir = mediaAccess?.workspaceDir ?? params.workspaceDir;
  if (mediaAccess?.readFile) {
    return {
      ...(params.maxBytes !== undefined ? { maxBytes: params.maxBytes } : {}),
      localRoots: "any",
      readFile: mediaAccess.readFile,
      hostReadCapability: true,
      ...(params.optimizeImages !== undefined ? { optimizeImages: params.optimizeImages } : {}),
      ...(workspaceDir ? { workspaceDir } : {}),
    };
  }
  const localRoots = mediaAccess?.localRoots;
  return {
    ...(params.maxBytes !== undefined ? { maxBytes: params.maxBytes } : {}),
    ...(localRoots ? { localRoots } : {}),
    ...(params.optimizeImages !== undefined ? { optimizeImages: params.optimizeImages } : {}),
    ...(workspaceDir ? { workspaceDir } : {}),
  };
}
