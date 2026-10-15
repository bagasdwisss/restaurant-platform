// In-memory / shared state for real-time dynamic QRIS sessions & 1-second webhook settlement

export interface QrisSession {
  referenceNo: string;
  orderNumber?: string;
  orderId?: number;
  amount: number;
  verificationCode: number;
  totalWithCode: number;
  status: "PENDING" | "SETTLED" | "EXPIRED";
  createdAt: number;
  expiresAt: number;
  settledAt?: number;
  paymentMethod?: string;
  customerName?: string;
}

// Global registry across hot-reloads in Node runtime
const globalForQris = global as unknown as {
  qrisSessions?: Map<string, QrisSession>;
};

export const qrisSessions =
  globalForQris.qrisSessions || new Map<string, QrisSession>();

if (process.env.NODE_ENV !== "production") {
  globalForQris.qrisSessions = qrisSessions;
}

export function createQrisSession({
  amount,
  orderNumber,
  orderId,
  customerName,
}: {
  amount: number;
  orderNumber?: string;
  orderId?: number;
  customerName?: string;
}): QrisSession {
  // Generate random 3-digit verification code e.g. 100-999
  const verificationCode = Math.floor(100 + Math.random() * 899);
  const totalWithCode = amount + verificationCode;
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  const referenceNo = `QRIS-SAV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${randomSuffix}`;

  const session: QrisSession = {
    referenceNo,
    orderNumber,
    orderId,
    amount,
    verificationCode,
    totalWithCode,
    status: "PENDING",
    createdAt: timestamp,
    expiresAt: timestamp + 15 * 60 * 1000, // 15 mins
    customerName,
  };

  qrisSessions.set(referenceNo, session);
  return session;
}

export function getQrisSession(referenceNo: string): QrisSession | null {
  const session = qrisSessions.get(referenceNo);
  if (!session) return null;

  // Check expiration
  if (session.status === "PENDING" && Date.now() > session.expiresAt) {
    session.status = "EXPIRED";
  }

  return session;
}

export function settleQrisSession(referenceNo: string, paymentMethod = "QRIS Dinamis"): QrisSession | null {
  const session = qrisSessions.get(referenceNo);
  if (!session) return null;

  session.status = "SETTLED";
  session.settledAt = Date.now();
  session.paymentMethod = paymentMethod;

  return session;
}
