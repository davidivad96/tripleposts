import { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";

export type PostStatus =
  | "idle"
  | "loading"
  | "success"
  | "partial_success"
  | "error";

export type PlatformStatus = {
  platform: "X" | "Threads";
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
