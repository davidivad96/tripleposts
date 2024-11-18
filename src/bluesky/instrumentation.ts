import { createContext } from "./context";

// TODOCB: This is probably quite stupid and unnecessary
// I have to learn more nextjs to avoid this
const ctx: Awaited<ReturnType<typeof createContext>> = await createContext(
  process.env.DB_PATH ?? ":memory:"
);

export const getContext = () => {
  if (!ctx) throw new Error("Context not registered");
  return ctx;
};
