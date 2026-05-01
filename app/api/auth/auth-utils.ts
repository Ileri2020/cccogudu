import crypto from 'crypto';

const SECRET = process.env.AUTH_SECRET || 'change-this-secret';
const DEFAULT_EXPIRY_SECONDS = 60 * 60 * 24 * 7; // 7 days

function base64urlEncode(value: Buffer | string) {
  const buffer = typeof value === 'string' ? Buffer.from(value, 'utf8') : value;
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(value: string) {
  const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), '=');
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(base64, 'base64').toString('utf8');
}

function sign(payload: string) {
  return base64urlEncode(crypto.createHmac('sha256', SECRET).update(payload).digest());
}

export function createAuthToken(data: Record<string, any>, expiresInSeconds = DEFAULT_EXPIRY_SECONDS) {
  const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64urlEncode(JSON.stringify({ ...data, exp: Math.floor(Date.now() / 1000) + expiresInSeconds }));
  const signature = sign(`${header}.${body}`);
  return `${header}.${body}.${signature}`;
}

export function verifyAuthToken(token: string) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const expected = sign(`${header}.${payload}`);
  const signatureBuf = Buffer.from(signature, 'utf8');
  const expectedBuf = Buffer.from(expected, 'utf8');

  if (signatureBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(signatureBuf, expectedBuf)) return null;

  const decoded = JSON.parse(base64urlDecode(payload));
  if (!decoded.exp || typeof decoded.exp !== 'number') return null;
  if (decoded.exp < Math.floor(Date.now() / 1000)) return null;

  return decoded;
}

export function extractBearerToken(req: Request) {
  const header = req.headers.get('authorization') || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

export function getAuthSession(req: Request) {
  const token = extractBearerToken(req);
  if (!token) return null;
  return verifyAuthToken(token);
}

export function isAdminSession(req: Request) {
  const session = getAuthSession(req);
  return session?.role === 'admin';
}
