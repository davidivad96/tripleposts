export type PostStatus = "idle" | "posting" | "success";

export type PostResult = {
  platform: "X" | "Threads";
  url: string;
};
