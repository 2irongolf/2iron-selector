type EventParams = {
  [key: string]: string | number | boolean;
};

// Function to safely push to dataLayer
export function trackEvent(eventName: string, params: EventParams = {}) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...params
    });
  }
}

// Analytics events we want to track
export const AnalyticsEvents = {
  FORM_START: 'form_start',
  FORM_STEP_COMPLETE: 'form_step_complete',
  FORM_SUBMISSION: 'form_submission',
  RECOMMENDATION_VIEW: 'recommendation_view',
  RECOMMENDATION_SHARE: 'recommendation_share',
  EMAIL_SENT: 'email_sent',
} as const;

// Add TypeScript support for dataLayer
declare global {
  interface Window {
    dataLayer: any[];
  }
} 