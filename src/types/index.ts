export type PostStatus =
  | "idle"
  | "posting"
  | "success"
  | "partial_success"
  | "error";

export type PostResult = {
  platform: "X" | "Threads";
  url: string;
};
