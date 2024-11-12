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
