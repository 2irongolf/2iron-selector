import { NextResponse } from 'next/server';
import type { FormData } from '@/types/form';
import type { Recommendation } from '@/types/recommendation';
import { sendRecommendationEmail, scheduleFollowUpEmails } from '@/services/email';

function generateRecommendation(data: FormData): Recommendation {
  let confidenceScore = 0;
  const reasons: string[] = [];

  // Analyze handicap
  const handicapMap = {
    'Beginner (30+)': 0,
    '20-30': 1,
    '10-20': 2,
    '5-10': 3,
    'Below 5': 4,
    'Scratch or better': 5
  };
  confidenceScore += handicapMap[data.handicap as keyof typeof handicapMap] || 0;

  // Analyze experience
  const experienceMap = {
    'Less than 1 year': 0,
    '1-3 years': 1,
    '3-5 years': 2,
    '5-10 years': 3,
    '10+ years': 4
  };
  confidenceScore += experienceMap[data.experience as keyof typeof experienceMap] || 0;

  // Analyze iron play ability
  const strengthMap = {
    'I struggle with long irons': 0,
    'I can handle a 4-iron comfortably': 2,
    'Long irons are my strength': 3,
    'I could probably fight a bear': 3
  };
  confidenceScore += strengthMap[data.strength as keyof typeof strengthMap] || 0;

  // Analyze practice frequency
  const practiceMap = {
    'Daily grinder': 3,
    'Weekly warrior': 2,
    'Monthly enthusiast': 1,
    'Special occasions only': 0
  };
  confidenceScore += practiceMap[data.practiceFrequency as keyof typeof practiceMap] || 0;

  // Analyze 7-iron distance
  const sevenIronDistance = parseInt(data.typicalIronDistances.sevenIron) || 0;
  if (sevenIronDistance >= 170) {
    confidenceScore += 3;
    reasons.push("Your 7-iron distance indicates you have the power needed for a 2-iron");
  } else if (sevenIronDistance >= 150) {
    confidenceScore += 2;
    reasons.push("Your 7-iron distance suggests you might have enough power for a 2-iron");
  } else if (sevenIronDistance > 0) {
    confidenceScore -= 1;
    reasons.push("Your current 7-iron distance suggests you might need more swing speed for a 2-iron");
  }

  // Analyze playing style
  if (data.playingStyle.includes('Aggressive')) {
    confidenceScore += 1;
    reasons.push("Your aggressive playing style could benefit from a 2-iron's versatility");
  } else if (data.playingStyle.includes('Conservative')) {
    reasons.push("While you prefer conservative play, a 2-iron could still be valuable for certain situations");
  }

  // Generate recommendation
  const isRecommended = confidenceScore >= 7;
  let mainReason = '';
  let alternativeSuggestion = '';
  let practiceRoutine: string[] = [];

  if (isRecommended) {
    mainReason = "Based on your skill level, experience, and power, you're ready for the challenge of a 2-iron!";
    practiceRoutine = [
      "Start with half-swing punch shots to build confidence",
      "Practice with alignment sticks to ensure proper path",
      "Gradually increase swing speed as you gain control",
      "Work on both low runners and higher trajectory shots"
    ];
  } else {
    mainReason = "A 2-iron might be challenging for your current game.";
    alternativeSuggestion = confidenceScore >= 5
      ? "Consider starting with a 3 or 4 iron to build confidence with long irons"
      : "A hybrid would be a better fit for your game right now";
    practiceRoutine = [
      "Focus on building consistent contact with your mid-irons",
      "Work on increasing swing speed through proper technique",
      "Practice with your longest current iron to build confidence"
    ];
  }

  return {
    isRecommended,
    mainReason,
    additionalReasons: reasons,
    alternativeSuggestion,
    practiceRoutine,
    confidenceScore
  };
}

export async function POST(request: Request) {
  try {
    const data: FormData = await request.json();
    
    // Generate the recommendation
    const recommendation = generateRecommendation(data);

    // Send the recommendation email
    await sendRecommendationEmail({
      name: data.name,
      email: data.email,
      recommendation,
      formData: data,
    });

    // Schedule follow-up emails
    await scheduleFollowUpEmails(data.email, data.name);

    return NextResponse.json({
      success: true,
      recommendation
    });
  } catch (error) {
    console.error('Error processing form submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process submission' },
      { status: 500 }
    );
  }
} 