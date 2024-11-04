import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

const SSOCallback = async () => (
  <AuthenticateWithRedirectCallback signInUrl="/" />
);

export default SSOCallback;
