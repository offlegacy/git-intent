export const INTENT_STATUS = ["active", "completed", "cancelled"] as const;

export type IntentStatus = (typeof INTENT_STATUS)[number];
