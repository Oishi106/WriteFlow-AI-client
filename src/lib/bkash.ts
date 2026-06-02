type BkashTokenResponse = {
  id_token: string;
  expires_in?: number | string;
  token_type?: string;
};

type BkashPaymentResponse = Record<string, unknown> & {
  paymentID?: string;
  bkashURL?: string;
  trxID?: string;
};

type BkashConfig = {
  baseUrl: string;
  username: string;
  password: string;
  appKey: string;
  appSecret: string;
};

type TokenCache = {
  value: string;
  expiresAt: number;
};

const getBkashConfig = (): BkashConfig => {
  const baseUrl = process.env.BKASH_BASE_URL;
  const username = process.env.BKASH_USERNAME;
  const password = process.env.BKASH_PASSWORD;
  const appKey = process.env.BKASH_APP_KEY;
  const appSecret = process.env.BKASH_APP_SECRET;

  if (!baseUrl || !username || !password || !appKey || !appSecret) {
    throw new Error('bKash env config missing. Set BKASH_* variables.');
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ''),
    username,
    password,
    appKey,
    appSecret,
  };
};

const getTokenCache = (): TokenCache | undefined => {
  const globalCache = globalThis as typeof globalThis & { __bkashToken?: TokenCache };
  return globalCache.__bkashToken;
};

const setTokenCache = (cache: TokenCache) => {
  const globalCache = globalThis as typeof globalThis & { __bkashToken?: TokenCache };
  globalCache.__bkashToken = cache;
};

const parseExpiresIn = (expiresIn?: number | string) => {
  if (!expiresIn) return 0;
  if (typeof expiresIn === 'number') return expiresIn;
  const parsed = Number(expiresIn);
  return Number.isFinite(parsed) ? parsed : 0;
};

const fetchBkashToken = async (): Promise<string> => {
  const config = getBkashConfig();
  const response = await fetch(`${config.baseUrl}/tokenized/checkout/token/grant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      username: config.username,
      password: config.password,
    },
    body: JSON.stringify({
      app_key: config.appKey,
      app_secret: config.appSecret,
    }),
  });

  const payload = (await response.json()) as BkashTokenResponse & {
    message?: string;
  };

  if (!response.ok || !payload?.id_token) {
    throw new Error(payload?.message || 'Failed to get bKash token.');
  }

  const expiresInSeconds = parseExpiresIn(payload.expires_in);
  const expiresAt = Date.now() + Math.max(expiresInSeconds - 30, 30) * 1000;
  setTokenCache({ value: payload.id_token, expiresAt });

  return payload.id_token;
};

export const getBkashToken = async (): Promise<string> => {
  const cached = getTokenCache();
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }
  return fetchBkashToken();
};

export const createBkashPayment = async (params: {
  amount: number;
  currency?: string;
  callbackURL: string;
  payerReference?: string;
  merchantInvoiceNumber: string;
}): Promise<BkashPaymentResponse> => {
  const config = getBkashConfig();
  const token = await getBkashToken();

  const response = await fetch(`${config.baseUrl}/tokenized/checkout/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: token,
      'X-APP-Key': config.appKey,
    },
    body: JSON.stringify({
      mode: '0011',
      payerReference: params.payerReference || 'writeflow',
      callbackURL: params.callbackURL,
      amount: params.amount.toFixed(2),
      currency: params.currency || 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: params.merchantInvoiceNumber,
    }),
  });

  const payload = (await response.json()) as BkashPaymentResponse & {
    message?: string;
  };

  if (!response.ok || !payload?.bkashURL) {
    throw new Error(payload?.message || 'Failed to create bKash payment.');
  }

  return payload;
};

export const executeBkashPayment = async (paymentId: string) => {
  const config = getBkashConfig();
  const token = await getBkashToken();

  const response = await fetch(`${config.baseUrl}/tokenized/checkout/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: token,
      'X-APP-Key': config.appKey,
    },
    body: JSON.stringify({ paymentID: paymentId }),
  });

  const payload = (await response.json()) as BkashPaymentResponse & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(payload?.message || 'Failed to execute bKash payment.');
  }

  return payload;
};
