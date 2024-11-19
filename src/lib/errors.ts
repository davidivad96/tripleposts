import { Platform } from "@/types";

export class PostError extends Error {
  constructor(
    message: string,
    public platform: Platform,
    public statusCode?: number
  ) {
    super(message);
    this.name = "PostError";
  }
}
