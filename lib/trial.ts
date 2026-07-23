export const TRIAL_LENGTH_DAYS = 30;

/** How many days before currentPeriodEnd we send a SenePay renewal reminder. */
export const SENEPAY_RENEWAL_REMINDER_DAYS = 3;

/** How many days after currentPeriodEnd a lapsed SenePay renewal stays PAST_DUE before EXPIRED (fully locked). */
export const SENEPAY_GRACE_PERIOD_DAYS = 5;

export function computeTrialEnd(from: Date = new Date()): Date {
  return new Date(from.getTime() + TRIAL_LENGTH_DAYS * 24 * 60 * 60 * 1000);
}
