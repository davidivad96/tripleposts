import { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";

export type PostStatus =
  | "idle"
  | "loading"
  | "success"
  | "partial_success"
  | "error";

export type PlatformStatus = {
  platform: Platform;
  status: PostStatus;
  url?: string;
  error?: string;
};

export type ThreadsMediaContainerStatus =
  | "EXPIRED"
  | "ERROR"
  | "FINISHED"
  | "IN_PROGRESS"
  | "PUBLISHED";

export type ExtraSession = {
  provider: string;
  profile: ProfileViewDetailed;
};

export type Platform = "X" | "Threads" | "Bluesky";

export type Media = { file: File; preview: string; type: "image" };

export type AccountStatus = {
  platform: Platform;
  enabled: boolean;
};
