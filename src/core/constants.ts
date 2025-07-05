export const INTENT_STATUS = [
  "created",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type IntentStatus = (typeof INTENT_STATUS)[number];
