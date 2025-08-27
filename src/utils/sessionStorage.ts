import { Session } from '@shopify/shopify-api';

interface StoredSession {
  id: string;
  shop: string;
  accessToken: string;
  scope: string;
  expires: Date | null;
  isOnline: boolean;
  createdAt: Date;
  // Store Shopify configuration per session
  shopifyConfig?: {
    shopName: string;
    accessToken: string;
    apiVersion: string;
  };
}

// Global server-side session storage (singleton pattern)
class ServerSessionStorage {
  private static instance: ServerSessionStorage;
  private sessions: Map<string, StoredSession> = new Map();

  private constructor() {}

  static getInstance(): ServerSessionStorage {
    if (!ServerSessionStorage.instance) {
      ServerSessionStorage.instance = new ServerSessionStorage();
    }
    return ServerSessionStorage.instance;
  }

  async storeSession(session: Session, shopifyConfig?: { shopName: string; accessToken: string; apiVersion: string }): Promise<boolean> {
    try {
      const storedSession: StoredSession = {
        id: session.id,
        shop: session.shop,
        accessToken: session.accessToken || '',
        scope: (session.scope ?? 'read_orders read_customers read_content') as string,
        expires: session.expires || null,
        isOnline: session.isOnline || false,
        createdAt: new Date(),
        shopifyConfig: shopifyConfig,
      };

      this.sessions.set(session.id, storedSession);
      console.log('✅ Server Session stored:', { id: session.id, shop: session.shop, hasConfig: !!shopifyConfig });
      return true;
    } catch (error) {
      console.error('❌ Error storing server session:', error);
      return false;
    }
  }

  async loadSession(id: string): Promise<Session | undefined> {
    try {
      const storedSession = this.sessions.get(id);

      if (!storedSession) {
        return undefined;
      }

      // Check if session is expired
      if (storedSession.expires && storedSession.expires < new Date()) {
        await this.deleteSession(id);
        return undefined;
      }

      return new Session({
        id: storedSession.id,
        shop: storedSession.shop,
        accessToken: storedSession.accessToken,
        scope: storedSession.scope,
        expires: storedSession.expires ?? undefined,
        isOnline: storedSession.isOnline,
        state: '',
      });
    } catch (error) {
      console.error('Error loading server session:', error);
      return undefined;
    }
  }

  async deleteSession(id: string): Promise<boolean> {
    try {
      this.sessions.delete(id);
      console.log('✅ Server Session deleted:', id);
      return true;
    } catch (error) {
      console.error('❌ Error deleting server session:', error);
      return false;
    }
  }

  async findSessionsByShop(shop: string): Promise<Session[]> {
    try {
      const shopSessions: Session[] = [];

      for (const storedSession of this.sessions.values()) {
        if (storedSession.shop === shop) {
          // Check if session is expired
          if (storedSession.expires && storedSession.expires < new Date()) {
            await this.deleteSession(storedSession.id);
            continue;
          }

          shopSessions.push(new Session({
            id: storedSession.id,
            shop: storedSession.shop,
            accessToken: storedSession.accessToken,
            scope: storedSession.scope,
            expires: storedSession.expires ?? undefined,
            isOnline: storedSession.isOnline,
            state: '',
          }));
        }
      }

      return shopSessions;
    } catch (error) {
      console.error('Error finding server sessions by shop:', error);
      return [];
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    try {
      const sessions = Array.from(this.sessions.values());
      console.log('🔍 Server SessionStorage: Total sessions in storage:', sessions.length);

      if (sessions.length === 0) {
        console.log('❌ Server SessionStorage: No sessions found');
        return null;
      }

      // Sort by creation date and get the most recent
      const recentSession = sessions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      console.log('📋 Server SessionStorage: Most recent session:', { id: recentSession.id, shop: recentSession.shop });

      // Check if session is expired
      if (recentSession.expires && recentSession.expires < new Date()) {
        await this.deleteSession(recentSession.id);
        return null;
      }

      return new Session({
        id: recentSession.id,
        shop: recentSession.shop,
        accessToken: recentSession.accessToken,
        scope: recentSession.scope,
        expires: recentSession.expires ?? undefined,
        isOnline: recentSession.isOnline,
        state: '',
      });
    } catch (error) {
      console.error('Error getting current server session:', error);
      return null;
    }
  }

  async getCurrentSessionWithConfig(): Promise<{ session: Session; config: { shopName: string; accessToken: string; apiVersion: string } | null } | null> {
    try {
      const sessions = Array.from(this.sessions.values());
      console.log('🔍 Server SessionStorage: Getting session with config, total sessions:', sessions.length);

      if (sessions.length === 0) {
        console.log('❌ Server SessionStorage: No sessions found');
        return null;
      }

      // Sort by creation date and get the most recent
      const recentSession = sessions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      console.log('📋 Server SessionStorage: Most recent session:', { id: recentSession.id, shop: recentSession.shop, hasConfig: !!recentSession.shopifyConfig });

      // Check if session is expired
      if (recentSession.expires && recentSession.expires < new Date()) {
        await this.deleteSession(recentSession.id);
        return null;
      }

      const session = new Session({
        id: recentSession.id,
        shop: recentSession.shop,
        accessToken: recentSession.accessToken,
        scope: recentSession.scope,
        expires: recentSession.expires ?? undefined,
        isOnline: recentSession.isOnline,
        state: '',
      });

      return {
        session,
        config: recentSession.shopifyConfig || null
      };
    } catch (error) {
      console.error('Error getting current server session with config:', error);
      return null;
    }
  }
}

// Client-side session storage
class ClientSessionStorage {
  private sessions: Map<string, StoredSession> = new Map();
  private readonly storageKey = 'cartcash_sessions';

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadSessions();
    }
  }

  private loadSessions() {
    try {
      if (typeof window === 'undefined') return;

      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const sessionsArray = JSON.parse(data);

        this.sessions = new Map(
          sessionsArray.map((session: any) => [
            session.id,
            {
              ...session,
              createdAt: new Date(session.createdAt),
              expires: session.expires ? new Date(session.expires) : null,
            }
          ])
        );

        console.log('✅ Client SessionStorage: Loaded', this.sessions.size, 'sessions from localStorage');
      }
    } catch (error) {
      console.error('❌ Client SessionStorage: Error loading sessions:', error);
    }
  }

  private saveSessions() {
    try {
      if (typeof window === 'undefined') return;

      const sessionsArray = Array.from(this.sessions.values());
      localStorage.setItem(this.storageKey, JSON.stringify(sessionsArray, null, 2));
      console.log('💾 Client SessionStorage: Saved', sessionsArray.length, 'sessions to localStorage');
    } catch (error) {
      console.error('❌ Client SessionStorage: Error saving sessions:', error);
    }
  }

  async storeSession(session: Session, shopifyConfig?: { shopName: string; accessToken: string; apiVersion: string }): Promise<boolean> {
    try {
      if (typeof window === 'undefined') {
        console.warn('⚠️ Client SessionStorage: storeSession called on server-side, this may not work as expected');
      }

      const storedSession: StoredSession = {
        id: session.id,
        shop: session.shop,
        accessToken: session.accessToken || '',
        scope: (session.scope ?? 'read_orders read_customers read_content') as string,
        expires: session.expires || null,
        isOnline: session.isOnline || false,
        createdAt: new Date(),
        shopifyConfig: shopifyConfig,
      };

      this.sessions.set(session.id, storedSession);
      this.saveSessions();

      console.log('✅ Client Session stored:', { id: session.id, shop: session.shop, hasConfig: !!shopifyConfig });
      return true;
    } catch (error) {
      console.error('❌ Error storing client session:', error);
      return false;
    }
  }

  async loadSession(id: string): Promise<Session | undefined> {
    try {
      if (typeof window === 'undefined') {
        console.warn('⚠️ Client SessionStorage: loadSession called on server-side, this may not work as expected');
        return undefined;
      }

      const storedSession = this.sessions.get(id);

      if (!storedSession) {
        return undefined;
      }

      // Check if session is expired
      if (storedSession.expires && storedSession.expires < new Date()) {
        await this.deleteSession(id);
        return undefined;
      }

      return new Session({
        id: storedSession.id,
        shop: storedSession.shop,
        accessToken: storedSession.accessToken,
        scope: storedSession.scope,
        expires: storedSession.expires ?? undefined,
        isOnline: storedSession.isOnline,
        state: '',
      });
    } catch (error) {
      console.error('Error loading client session:', error);
      return undefined;
    }
  }

  async deleteSession(id: string): Promise<boolean> {
    try {
      if (typeof window === 'undefined') {
        console.warn('⚠️ Client SessionStorage: deleteSession called on server-side, this may not work as expected');
      }

      this.sessions.delete(id);
      this.saveSessions();
      console.log('✅ Client Session deleted:', id);
      return true;
    } catch (error) {
      console.error('❌ Error deleting client session:', error);
      return false;
    }
  }

  async findSessionsByShop(shop: string): Promise<Session[]> {
    try {
      if (typeof window === 'undefined') {
        console.warn('⚠️ Client SessionStorage: findSessionsByShop called on server-side, this may not work as expected');
        return [];
      }

      const shopSessions: Session[] = [];

      for (const storedSession of this.sessions.values()) {
        if (storedSession.shop === shop) {
          // Check if session is expired
          if (storedSession.expires && storedSession.expires < new Date()) {
            await this.deleteSession(storedSession.id);
            continue;
          }

          shopSessions.push(new Session({
            id: storedSession.id,
            shop: storedSession.shop,
            accessToken: storedSession.accessToken,
            scope: storedSession.scope,
            expires: storedSession.expires ?? undefined,
            isOnline: storedSession.isOnline,
            state: '',
          }));
        }
      }

      return shopSessions;
    } catch (error) {
      console.error('Error finding client sessions by shop:', error);
      return [];
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    try {
      if (typeof window === 'undefined') {
        console.warn('⚠️ Client SessionStorage: getCurrentSession called on server-side, this may not work as expected');
        return null;
      }

      const sessions = Array.from(this.sessions.values());
      console.log('🔍 Client SessionStorage: Total sessions in storage:', sessions.length);

      if (sessions.length === 0) {
        console.log('❌ Client SessionStorage: No sessions found');
        return null;
      }

      // Sort by creation date and get the most recent
      const recentSession = sessions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      console.log('📋 Client SessionStorage: Most recent session:', { id: recentSession.id, shop: recentSession.shop });

      // Check if session is expired
      if (recentSession.expires && recentSession.expires < new Date()) {
        await this.deleteSession(recentSession.id);
        return null;
      }

      return new Session({
        id: recentSession.id,
        shop: recentSession.shop,
        accessToken: recentSession.accessToken,
        scope: recentSession.scope,
        expires: recentSession.expires ?? undefined,
        isOnline: recentSession.isOnline,
        state: '',
      });
    } catch (error) {
      console.error('Error getting current client session:', error);
      return null;
    }
  }

  async getCurrentSessionWithConfig(): Promise<{ session: Session; config: { shopName: string; accessToken: string; apiVersion: string } | null } | null> {
    try {
      if (typeof window === 'undefined') {
        console.warn('⚠️ Client SessionStorage: getCurrentSessionWithConfig called on server-side, this may not work as expected');
        return null;
      }

      const sessions = Array.from(this.sessions.values());
      console.log('🔍 Client SessionStorage: Getting session with config, total sessions:', sessions.length);

      if (sessions.length === 0) {
        console.log('❌ Client SessionStorage: No sessions found');
        return null;
      }

      // Sort by creation date and get the most recent
      const recentSession = sessions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      console.log('📋 Client SessionStorage: Most recent session:', { id: recentSession.id, shop: recentSession.shop, hasConfig: !!recentSession.shopifyConfig });

      // Check if session is expired
      if (recentSession.expires && recentSession.expires < new Date()) {
        await this.deleteSession(recentSession.id);
        return null;
      }

      const session = new Session({
        id: recentSession.id,
        shop: recentSession.shop,
        accessToken: recentSession.accessToken,
        scope: recentSession.scope,
        expires: recentSession.expires ?? undefined,
        isOnline: recentSession.isOnline,
        state: '',
      });

      return {
        session,
        config: recentSession.shopifyConfig || null
      };
    } catch (error) {
      console.error('Error getting current client session with config:', error);
      return null;
    }
  }
}

class SessionStorage {
  private serverStorage: ServerSessionStorage;
  private clientStorage: ClientSessionStorage;

  constructor() {
    this.serverStorage = ServerSessionStorage.getInstance();
    this.clientStorage = new ClientSessionStorage();
  }

  async storeSession(session: Session, shopifyConfig?: { shopName: string; accessToken: string; apiVersion: string }): Promise<boolean> {
    // Store in both server and client storage
    await this.serverStorage.storeSession(session, shopifyConfig);
    if (typeof window !== 'undefined') {
      await this.clientStorage.storeSession(session, shopifyConfig);
    }
    return true;
  }

  async loadSession(id: string): Promise<Session | undefined> {
    if (typeof window === 'undefined') {
      return await this.serverStorage.loadSession(id);
    } else {
      return await this.clientStorage.loadSession(id);
    }
  }

  async deleteSession(id: string): Promise<boolean> {
    await this.serverStorage.deleteSession(id);
    if (typeof window !== 'undefined') {
      await this.clientStorage.deleteSession(id);
    }
    return true;
  }

  async findSessionsByShop(shop: string): Promise<Session[]> {
    if (typeof window === 'undefined') {
      return await this.serverStorage.findSessionsByShop(shop);
    } else {
      return await this.clientStorage.findSessionsByShop(shop);
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    if (typeof window === 'undefined') {
      return await this.serverStorage.getCurrentSession();
    } else {
      return await this.clientStorage.getCurrentSession();
    }
  }

  async getCurrentSessionWithConfig(): Promise<{ session: Session; config: { shopName: string; accessToken: string; apiVersion: string } | null } | null> {
    if (typeof window === 'undefined') {
      return await this.serverStorage.getCurrentSessionWithConfig();
    } else {
      return await this.clientStorage.getCurrentSessionWithConfig();
    }
  }
}

export const sessionStorage = new SessionStorage();
