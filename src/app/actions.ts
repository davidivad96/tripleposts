"use server";

export const postToX = async (content: string) => {
  console.log("Posting to X:", content);
  await new Promise((resolve) => setTimeout(resolve, 2000));
};

export const postToThreads = async (content: string) => {
  console.log("Posting to Threads:", content);
  await new Promise((resolve) => setTimeout(resolve, 2000));
};
