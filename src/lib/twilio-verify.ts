import twilio from "twilio";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

export function getTwilioVerifyClient() {
  const accountSid = requireEnv("TWILIO_ACCOUNT_SID");
  const authToken = requireEnv("TWILIO_AUTH_TOKEN");
  return twilio(accountSid, authToken);
}

export function getVerifyServiceSid(): string {
  return requireEnv("TWILIO_VERIFY_SERVICE_SID");
}
