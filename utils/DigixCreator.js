import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const FILE = 'database/digix2/shadow.enc';
const SECRET = process.env.OWNER_KEY;

if (!SECRET) {
  console.warn('WARNING: OWNER_KEY is not set!');
}

const ALGO = 'aes-256-cbc';

function getKey() {
  return crypto.createHash('sha256').update(SECRET || 'fallback-unsafe-key').digest();
}

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

export async function encryptOwners(ownerArray) {
  await ensureDir(FILE);

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);

  let encrypted = cipher.update(JSON.stringify(ownerArray), 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const payload = iv.toString('hex') + ':' + encrypted;

  await fs.writeFile(FILE, payload, 'utf8');
}

export async function decryptOwners() {
  try {
    const data = await fs.readFile(FILE, 'utf8');

    const parts = data.split(':');
    if (parts.length !== 2) return [];

    const [ivHex, encrypted] = parts;

    const decipher = crypto.createDecipheriv(
      ALGO,
      getKey(),
      Buffer.from(ivHex, 'hex')
    );

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  } catch (err) {
    return [];
  }
}