export type S3Config = {
  endpoint?: string;
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  forcePathStyle: boolean;
  tls: boolean;
};

const getBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) {
    return defaultValue;
  }
  return value.toLowerCase() === "true" || value === "1";
};

export const loadConfig = (): S3Config => {
  return {
    endpoint: process.env.S3_ENDPOINT || undefined,
    region: process.env.S3_REGION || "us-east-1",
    accessKeyId: process.env.S3_ACCESS_KEY_ID || undefined,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || undefined,
    sessionToken: process.env.S3_SESSION_TOKEN || undefined,
    forcePathStyle: getBoolean(process.env.S3_FORCE_PATH_STYLE, true),
    tls: getBoolean(process.env.S3_TLS, true)
  };
};
