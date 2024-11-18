import { Agent } from "@atproto/api";
import { IdResolver, MemoryCache } from "@atproto/identity";
import type { OAuthClient } from "@atproto/oauth-client-node";
import { NodeOAuthClient } from "@atproto/oauth-client-node";
import { cookies } from "next/headers";
import { createDb, Database, migrateToLatest } from "./db";

export type Session = { did: string };

const HOUR = 60e3 * 60;
const DAY = HOUR * 24;

export const createIdResolver = () =>
  new IdResolver({
    didCache: new MemoryCache(HOUR, DAY),
  });

export interface BidirectionalResolver {
  resolveDidToHandle(did: string): Promise<string>;
  resolveDidsToHandles(dids: string[]): Promise<Record<string, string>>;
}

export const createBidirectionalResolver = (resolver: IdResolver) => ({
  async resolveDidToHandle(did: string): Promise<string> {
    const didDoc = await resolver.did.resolveAtprotoData(did);
    const resolvedHandle = await resolver.handle.resolve(didDoc.handle);
    if (resolvedHandle === did) {
      return didDoc.handle;
    }
    return did;
  },

  async resolveDidsToHandles(dids: string[]): Promise<Record<string, string>> {
    const didHandleMap: Record<string, string> = {};
    const resolves = await Promise.all(
      dids.map((did) => this.resolveDidToHandle(did).catch(() => did))
    );
    for (let i = 0; i < dids.length; i++) {
      didHandleMap[dids[i]] = resolves[i];
    }
    return didHandleMap;
  },
});

import type {
  NodeSavedSession,
  NodeSavedSessionStore,
  NodeSavedState,
  NodeSavedStateStore,
} from "@atproto/oauth-client-node";
import { getIronSession } from "iron-session";

export class StateStore implements NodeSavedStateStore {
  constructor(private db: Database) {}

  get = async (key: string): Promise<NodeSavedState | undefined> => {
    const result = await this.db
      .selectFrom("auth_state")
      .selectAll()
      .where("key", "=", key)
      .executeTakeFirst();
    if (!result) return;
    return JSON.parse(result.state) as NodeSavedState;
  };

  set = async (key: string, val: NodeSavedState) => {
    const state = JSON.stringify(val);
    await this.db
      .insertInto("auth_state")
      .values({ key, state })
      .onConflict((oc) => oc.column("key").doUpdateSet({ state }))
      .execute();
  };

  del = async (key: string) => {
    await this.db.deleteFrom("auth_state").where("key", "=", key).execute();
  };
}

export class SessionStore implements NodeSavedSessionStore {
  constructor(private db: Database) {}

  get = async (key: string): Promise<NodeSavedSession | undefined> => {
    const result = await this.db
      .selectFrom("auth_session")
      .selectAll()
      .where("key", "=", key)
      .executeTakeFirst();
    if (!result) return;
    return JSON.parse(result.session) as NodeSavedSession;
  };

  set = async (key: string, val: NodeSavedSession) => {
    const session = JSON.stringify(val);
    await this.db
      .insertInto("auth_session")
      .values({ key, session })
      .onConflict((oc) => oc.column("key").doUpdateSet({ session }))
      .execute();
  };

  del = async (key: string) => {
    await this.db.deleteFrom("auth_session").where("key", "=", key).execute();
  };
}

export const createClient = async (
  stateStore: StateStore,
  sessionStore: SessionStore
) => {
  const publicUrl = process.env.PUBLIC_URL;
  const url = publicUrl || `http://127.0.0.1:${process.env.PORT}`;
  const enc = encodeURIComponent;
  return new NodeOAuthClient({
    clientMetadata: {
      client_name: "AT Protocol Express App",
      client_id: publicUrl
        ? `${url}/client-metadata.json`
        : `http://localhost?redirect_uri=${enc(
            `${url}/oauth/callback`
          )}&scope=${enc("atproto transition:generic")}`,
      client_uri: url,
      redirect_uris: [`${url}/oauth/callback`],
      scope: "atproto transition:generic",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      application_type: "web",
      token_endpoint_auth_method: "none",
      dpop_bound_access_tokens: true,
    },
    stateStore,
    sessionStore,
  });
};

export type AppContext = {
  db: Database;
  oauthClient: OAuthClient;
  resolver: BidirectionalResolver;
};

export const createContext = async () => {
  const db = createDb();
  await migrateToLatest(db);
  const stateStore = new StateStore(db);
  const sessionStore = new SessionStore(db);
  const oauthClient = await createClient(stateStore, sessionStore);
  const baseIdResolver = createIdResolver();
  const resolver = createBidirectionalResolver(baseIdResolver);
  return {
    db,
    oauthClient,
    resolver,
  };
};

export const getSessionAgent = async (ctx: AppContext) => {
  if (!process.env.COOKIE_SECRET) throw new Error("COOKIE_SECRET is not set");
  const session = await getIronSession<Session>(await cookies(), {
    cookieName: "sid",
    password: process.env.COOKIE_SECRET,
  });
  if (!session.did) return null;
  try {
    const oauthSession = await ctx.oauthClient.restore(session.did);
    return oauthSession ? new Agent(oauthSession) : null;
  } catch (err) {
    console.log("### oauth restore error", err);
    return null;
  }
};
