import fs from "node:fs";
import path from "node:path";

export type StoredAccount = {
  email: string;
  password: string;
};

const ACCOUNT_FILE = path.resolve(process.cwd(), ".auth-users.json");

function readPool(): StoredAccount[] {
  try {
    const raw = fs.readFileSync(ACCOUNT_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is StoredAccount =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as StoredAccount).email === "string" &&
        typeof (item as StoredAccount).password === "string"
    );
  } catch {
    return [];
  }
}

function writePool(accounts: StoredAccount[]): void {
  fs.writeFileSync(ACCOUNT_FILE, JSON.stringify(accounts, null, 2), "utf8");
}

export function loadStoredAccounts(): StoredAccount[] {
  return readPool();
}

export function saveAccount(account: StoredAccount): void {
  const existing = readPool().filter((entry) => entry.email !== account.email);
  const next = [account, ...existing].slice(0, 20);
  writePool(next);
}

export function removeAccount(email: string): void {
  const existing = readPool().filter((entry) => entry.email !== email);
  writePool(existing);
}
