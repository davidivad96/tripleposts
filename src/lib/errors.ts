export class PostError extends Error {
  constructor(
    message: string,
    public platform: "X" | "Threads",
    public statusCode?: number
  ) {
    super(message);
    this.name = "PostError";
  }
}
