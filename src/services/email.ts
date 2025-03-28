import type { FormData } from '@/types/form';
import type { Recommendation } from '@/types/recommendation';

interface EmailParams {
  name: string;
  email: string;
  recommendation: Recommendation;
  formData: FormData;
}

export async function sendRecommendationEmail({ name, email, recommendation, formData }: EmailParams) {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY || '',
      },
      body: JSON.stringify({
        templateId: parseInt(process.env.BREVO_RECOMMENDATION_TEMPLATE_ID || '0'),
        to: [{ email, name }],
        params: {
          name,
          isRecommended: recommendation.isRecommended,
          mainReason: recommendation.mainReason,
          additionalReasons: recommendation.additionalReasons,
          alternativeSuggestion: recommendation.alternativeSuggestion,
          practiceRoutine: recommendation.practiceRoutine,
          handicap: formData.handicap,
          experience: formData.experience,
          playingStyle: formData.playingStyle,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return true;
  } catch (error) {
    console.error('Error sending recommendation email:', error);
    throw error;
  }
}

export async function scheduleFollowUpEmails(email: string, name: string) {
  try {
    // Schedule follow-up emails using Brevo's automation feature
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY || '',
      },
      body: JSON.stringify({
        email,
        attributes: {
          FIRSTNAME: name,
          ASSESSMENT_DATE: new Date().toISOString(),
        },
        listIds: [2], // You'll need to create this list in Brevo
        updateEnabled: true,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to schedule follow-up emails');
    }

    return true;
  } catch (error) {
    console.error('Error scheduling follow-up emails:', error);
    throw error;
  }
} 