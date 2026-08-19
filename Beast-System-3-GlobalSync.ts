// Beast-System-3-GlobalSync.ts
// Global synchronization layer for Beast System 3.0

export interface SyncRecord {
  key: string;
  value: any;
  version: number;
  timestamp: number;
}

export class GlobalSync {
  private store = new Map<string, SyncRecord>();

  // ---- GET CURRENT RECORD ----
  get(key: string): SyncRecord | null {
    return this.store.get(key) || null;
  }

  // ---- SET VALUE WITH VERSIONING ----
  set(key: string, value: any): SyncRecord {
    const existing = this.store.get(key);
    const newRecord: SyncRecord = {
      key,
      value,
      version: existing ? existing.version + 1 : 1,
      timestamp: Date.now()
    };

    this.store.set(key, newRecord);
    return newRecord;
  }

  // ---- SYNC FROM REMOTE NODE ----
  sync(remoteRecord: SyncRecord): SyncRecord {
    const local = this.store.get(remoteRecord.key);

    // If no local record, accept remote
    if (!local) {
      this.store.set(remoteRecord.key, remoteRecord);
      return remoteRecord;
    }

    // Conflict resolution: highest version wins
    if (remoteRecord.version > local.version) {
      this.store.set(remoteRecord.key, remoteRecord);
      return remoteRecord;
    }

    // Local wins
    return local;
  }

  // ---- LIST ALL SYNC RECORDS ----
  list(): SyncRecord[] {
    return [...this.store.values()];
  }

  // ---- EXPORT SYNC SNAPSHOT ----
  snapshot(): Record<string, SyncRecord> {
    const out: Record<string, SyncRecord> = {};
    for (const [key, record] of this.store.entries()) {
      out[key] = record;
    }
    return out;
  }
}
