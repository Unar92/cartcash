import { Session } from '@shopify/shopify-api';
import fs from 'fs';
import path from 'path';

interface StoredSession {
  id: string;
  shop: string;
  accessToken: string;
  scope: string;
  expires: Date | null;
  isOnline: boolean;
  createdAt: Date;
}

class SessionStorage {
  private sessions: Map<string, StoredSession> = new Map();
  private storageFile: string;

  constructor() {
    // Use a file in the .next directory for persistence
    this.storageFile = path.join(process.cwd(), '.next', 'sessions.json');
    this.loadSessions();
  }

  private loadSessions() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const data = fs.readFileSync(this.storageFile, 'utf8');
        const sessionsArray = JSON.parse(data);

        // Convert back to Map and restore Date objects
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

        console.log('✅ SessionStorage: Loaded', this.sessions.size, 'sessions from file');
      }
    } catch (error) {
      console.error('❌ SessionStorage: Error loading sessions:', error);
    }
  }

  private saveSessions() {
    try {
      const sessionsArray = Array.from(this.sessions.values());
      fs.writeFileSync(this.storageFile, JSON.stringify(sessionsArray, null, 2));
      console.log('💾 SessionStorage: Saved', sessionsArray.length, 'sessions to file');
    } catch (error) {
      console.error('❌ SessionStorage: Error saving sessions:', error);
    }
  }

  async storeSession(session: Session): Promise<boolean> {
    try {
      const storedSession: StoredSession = {
        id: session.id,
        shop: session.shop,
        accessToken: session.accessToken || '',
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        scope: (session.scope ?? 'read_orders read_customers read_content') as string,
        expires: session.expires || null,
        isOnline: session.isOnline || false,
        createdAt: new Date(),
      };

      this.sessions.set(session.id, storedSession);
      this.saveSessions();

      console.log('✅ Session stored:', { id: session.id, shop: session.shop });
      return true;
    } catch (error) {
      console.error('❌ Error storing session:', error);
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
      console.error('Error loading session:', error);
      return undefined;
    }
  }

  async deleteSession(id: string): Promise<boolean> {
    try {
      this.sessions.delete(id);
      this.saveSessions();
      console.log('✅ Session deleted:', id);
      return true;
    } catch (error) {
      console.error('❌ Error deleting session:', error);
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
      console.error('Error finding sessions by shop:', error);
      return [];
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    try {
      // Get the most recent session (in a real app, you'd get this from cookies or headers)
      const sessions = Array.from(this.sessions.values());
      console.log('🔍 SessionStorage: Total sessions in storage:', sessions.length);

      if (sessions.length === 0) {
        console.log('❌ SessionStorage: No sessions found');
        return null;
      }

      // Sort by creation date and get the most recent
      const recentSession = sessions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      console.log('📋 SessionStorage: Most recent session:', { id: recentSession.id, shop: recentSession.shop });

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
      console.error('Error getting current session:', error);
      return null;
    }
  }
}

export const sessionStorage = new SessionStorage();
