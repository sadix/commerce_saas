import crypto from 'crypto';

const SENEPAY_BASE_URL = 'https://api.sene-pay.com/api/v1';

if (!process.env.SENEPAY_API_KEY || !process.env.SENEPAY_API_SECRET) {
  console.warn('SENEPAY_API_KEY / SENEPAY_API_SECRET are not set — SenePay checkout will fail.');
}

function senepayHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Api-Key': process.env.SENEPAY_API_KEY ?? '',
    'X-Api-Secret': process.env.SENEPAY_API_SECRET ?? '',
  };
}

export interface SenePayCheckoutSession {
  sessionToken: string;
  checkoutUrl: string;
  amount: number;
  currency: string;
  orderReference: string;
  status: 'Open' | 'Processing' | 'Complete' | 'Failed' | 'Cancelled' | 'Expired';
  expiresAt: string;
  createdAt: string;
}

export interface CreateSenePayCheckoutInput {
  /** Amount in XOF (whole francs, no decimals). */
  amount: number;
  /** Your own unique reference for this charge — echoed back on the webhook. */
  orderReference: string;
  description?: string;
  returnUrl: string;
  cancelUrl?: string;
  webhookUrl: string;
  /** ISO 2-letter country code, e.g. "SN". Omit to let the customer pick. */
  country?: string;
  metadata?: Record<string, string>;
}

export async function createSenePayCheckoutSession(
  input: CreateSenePayCheckoutInput
): Promise<SenePayCheckoutSession> {
  const response = await fetch(`${SENEPAY_BASE_URL}/checkout/sessions`, {
    method: 'POST',
    headers: senepayHeaders(),
    body: JSON.stringify({
      amount: input.amount,
      currency: 'XOF', // required by SenePay — no default, a missing value is a 400
      orderReference: input.orderReference,
      description: input.description,
      returnUrl: input.returnUrl,
      cancelUrl: input.cancelUrl,
      webhookUrl: input.webhookUrl,
      country: input.country ?? 'SN',
      metadata: input.metadata,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || body.error || `SenePay checkout session failed (HTTP ${response.status})`);
  }

  return response.json();
}

export interface SenePaySessionStatus extends SenePayCheckoutSession {
  completedAt?: string;
  payment?: {
    transactionId: string;
    operator: string;
    country: string;
    phoneNumber: string;
    amountPaid: number;
    fees: number;
    netAmount: number;
    paidAt: string;
  };
}

export async function getSenePaySessionStatus(sessionToken: string): Promise<SenePaySessionStatus> {
  const response = await fetch(`${SENEPAY_BASE_URL}/checkout/sessions/${sessionToken}`, {
    headers: senepayHeaders(),
  });

  if (!response.ok) {
    throw new Error(`SenePay status check failed (HTTP ${response.status})`);
  }

  return response.json();
}

/**
 * Verifies the `X-SenePay-Signature` header against the RAW request body.
 * Must be called with the body exactly as received (before JSON.parse) —
 * signing is over raw bytes, not the re-serialized object.
 */
export function verifySenePaySignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;
  if (!process.env.SENEPAY_WEBHOOK_SECRET) {
    console.error('SENEPAY_WEBHOOK_SECRET is not set — refusing to trust unverified webhook');
    return false;
  }

  const expected = crypto
    .createHmac('sha256', process.env.SENEPAY_WEBHOOK_SECRET)
    .update(rawBody, 'utf8')
    .digest('hex');

  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export interface SenePayWebhookPayload {
  event: 'checkout.session.completed' | 'checkout.session.failed';
  sessionToken: string;
  orderReference: string;
  status: string;
  amount: number;
  currency: string;
  fees: number;
  netAmount: number;
  transactionId: string;
  customer_phone: string;
  metadata?: Record<string, string>;
  timestamp: string;
}
