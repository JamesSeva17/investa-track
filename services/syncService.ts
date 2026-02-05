
import { SyncData } from "../types.ts";

/**
 * JSONBin.io v3 Integration (Private Mode)
 */
const JSONBIN_API_BASE = "https://api.jsonbin.io/v3/b";
const MASTER_KEY = "$2a$10$UDkVQcUTb9K75p2Xf6rO1u6Ytn.lxwZVSkFN49vHZKO3.trLqSWY2";

export const syncService = {
  async push(key: string, data: SyncData): Promise<string | null> {
    try {
      const isNew = !key;
      const url = isNew ? JSONBIN_API_BASE : `${JSONBIN_API_BASE}/${key}`;
      const method = isNew ? 'POST' : 'PUT';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Master-Key': MASTER_KEY,
      };

      if (isNew) {
        headers['X-Bin-Private'] = 'true';
        headers['X-Bin-Name'] = `Vaultify_Backup_${Date.now()}`;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`JSONBin push failed (${response.status}): ${errorText}`);
        return null;
      }

      const result = await response.json();
      return isNew ? result.metadata.id : key;
    } catch (error) {
      console.error("JSONBin push failed:", error);
      return null;
    }
  },

  async pull(key: string): Promise<SyncData | null> {
    if (!key) return null;
    try {
      const response = await fetch(`${JSONBIN_API_BASE}/${key}/latest`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': MASTER_KEY,
        },
      });

      if (!response.ok) {
        console.error(`JSONBin pull failed (${response.status})`);
        return null;
      }

      const result = await response.json();
      return result.record as SyncData;
    } catch (error) {
      console.error("JSONBin pull failed:", error);
      return null;
    }
  }
};
