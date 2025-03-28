'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { FormData } from '@/types/form';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'select' | 'checkbox';
  placeholder?: string;
  options?: string[];
  optional?: boolean;
}

interface QuestionSection {
  id: string;
  title: string;
  subtitle: string;
  fields: FormField[];
}

interface Recommendation {
  isRecommended: boolean;
  mainReason: string;
  additionalReasons: string[];
  alternativeSuggestion?: string;
  practiceRoutine?: string[];
  confidenceScore: number;
}

interface FieldError {
  field: string;
  message: string;
}

const Questionnaire: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    handicap: '',
    experience: '',
    height: '',
    strength: '',
    swingSpeed: '',
    typicalIronDistances: {
      sevenIron: '',
      fourIron: '',
    },
    playingStyle: '',
    currentStruggles: [],
    practiceFrequency: '',
  });

  useEffect(() => {
    // Track form start when component mounts
    trackEvent(AnalyticsEvents.FORM_START);
  }, []);

  const questions: QuestionSection[] = [
    {
      id: 'contact',
      title: "Ready to Find Out if a 2-Iron is Right for You? 🏌️‍♂️",
      subtitle: "Let's start with some basic info",
      fields: [
        { name: 'name', label: 'Your Name', type: 'text' },
        { name: 'email', label: 'Email (for your personalized 2-iron recommendation)', type: 'email' },
      ],
    },
    {
      id: 'skill',
      title: 'Your Golf Profile',
      subtitle: "This helps us understand if you're ready for a 2-iron",
      fields: [
        {
          name: 'handicap',
          label: "What's your handicap?",
          type: 'select',
          options: [
            'Beginner (30+)',
            '20-30',
            '10-20',
            '5-10',
            'Below 5',
            'Scratch or better'
          ],
        },
        {
          name: 'experience',
          label: 'Years playing golf',
          type: 'select',
          options: [
            'Less than 1 year',
            '1-3 years',
            '3-5 years',
            '5-10 years',
            '10+ years'
          ],
        },
      ],
    },
    {
      id: 'physical',
      title: 'Physical Attributes',
      subtitle: 'A 2-iron requires specific physical capabilities',
      fields: [
        { 
          name: 'height', 
          label: 'Your height', 
          type: 'text', 
          placeholder: "e.g., 5'10\"" 
        },
        {
          name: 'strength',
          label: 'How would you rate your ability with long irons?',
          type: 'select',
          options: [
            'I struggle with long irons',
            'I can handle a 4-iron comfortably',
            'Long irons are my strength',
            'I could probably fight a bear'
          ],
        },
        {
          name: 'swingSpeed',
          label: 'Driver swing speed (if known)',
          type: 'text',
          placeholder: 'e.g., 95 mph',
          optional: true,
        },
      ],
    },
    {
      id: 'distances',
      title: 'Current Iron Play',
      subtitle: 'This helps us gauge if a 2-iron matches your game',
      fields: [
        {
          name: 'typicalIronDistances.sevenIron',
          label: 'How far do you hit your 7-iron? (yards)',
          type: 'text',
          placeholder: 'e.g., 150',
        },
        {
          name: 'typicalIronDistances.fourIron',
          label: 'How far do you hit your 4-iron? (if you use one)',
          type: 'text',
          placeholder: 'e.g., 180',
          optional: true,
        },
      ],
    },
    {
      id: 'style',
      title: 'Playing Style & Goals',
      subtitle: "Let's understand why you're interested in a 2-iron",
      fields: [
        {
          name: 'playingStyle',
          label: 'What best describes your playing style?',
          type: 'select',
          options: [
            'Conservative - I prefer safer shots',
            'Balanced - I mix it up depending on the situation',
            "Aggressive - I'm here for a good time, not a long time",
          ],
        },
        {
          name: 'currentStruggles',
          label: 'Select your current challenges (multiple choice)',
          type: 'checkbox',
          options: [
            'Consistency with long irons',
            'Getting enough height on long shots',
            'Want more shot shape options',
            'Need more distance control',
            'Looking for a hybrid alternative',
          ],
        },
        {
          name: 'practiceFrequency',
          label: 'How often do you practice?',
          type: 'select',
          options: [
            'Daily grinder',
            'Weekly warrior',
            'Monthly enthusiast',
            'Special occasions only',
          ],
        },
      ],
    },
  ];

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateCurrentStep = (): boolean => {
    const currentFields = questions[currentStep].fields;
    const newErrors: FieldError[] = [];

    currentFields.forEach(field => {
      const value = field.name.includes('.')
        ? field.name.split('.').reduce((obj, key) => obj[key], formData as any)
        : formData[field.name as keyof FormData];

      if (!field.optional) {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          newErrors.push({
            field: field.name,
            message: `${field.label} is required`
          });
        }
      }

      if (value && field.type === 'email' && !validateEmail(value as string)) {
        newErrors.push({
          field: field.name,
          message: 'Please enter a valid email address'
        });
      }

      if (value && field.name.includes('Iron') && !/^\d+$/.test(value as string)) {
        newErrors.push({
          field: field.name,
          message: 'Please enter a valid distance in yards'
        });
      }
    });

    setFieldErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      trackEvent(AnalyticsEvents.FORM_SUBMISSION, {
        handicap: formData.handicap,
        experience: formData.experience,
        playingStyle: formData.playingStyle,
      });

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit form');
      }

      setRecommendation(data.recommendation);
      setCurrentStep(questions.length); // Move to recommendation display

      // Track successful recommendation view
      trackEvent(AnalyticsEvents.RECOMMENDATION_VIEW, {
        isRecommended: data.recommendation.isRecommended,
        confidenceScore: data.recommendation.confidenceScore,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      
      // Track form errors
      trackEvent('form_error', {
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < questions.length - 1) {
      // Track step completion
      trackEvent(AnalyticsEvents.FORM_STEP_COMPLETE, {
        step: currentStep + 1,
        stepName: questions[currentStep].id,
      });

      setCurrentStep(prev => prev + 1);
      setFieldErrors([]);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStartOver = () => {
    trackEvent('form_restart');
    setCurrentStep(0);
    setRecommendation(null);
    setFormData({
      name: '',
      email: '',
      handicap: '',
      experience: '',
      height: '',
      strength: '',
      swingSpeed: '',
      typicalIronDistances: {
        sevenIron: '',
        fourIron: '',
      },
      playingStyle: '',
      currentStruggles: [],
      practiceFrequency: '',
    });
  };

  const currentQuestion = questions[currentStep];

  if (currentStep === questions.length && recommendation) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {recommendation.isRecommended ? "🎯 You're Ready for a 2-Iron!" : "🤔 Not Just Yet"}
          </h2>
          <p className="text-xl text-gray-600 mb-6">{recommendation.mainReason}</p>
        </div>

        {recommendation.additionalReasons.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Here's why:</h3>
            <ul className="list-disc pl-5 space-y-2">
              {recommendation.additionalReasons.map((reason, index) => (
                <li key={index} className="text-gray-700">{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {recommendation.alternativeSuggestion && (
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Suggestion</h3>
            <p className="text-gray-700">{recommendation.alternativeSuggestion}</p>
          </div>
        )}

        {recommendation.practiceRoutine && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Practice Plan:</h3>
            <ul className="list-decimal pl-5 space-y-2">
              {recommendation.practiceRoutine.map((step, index) => (
                <li key={index} className="text-gray-700">{step}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 mb-4">
            We've sent a detailed recommendation to your email with specific club suggestions and training tips.
          </p>
          <button
            onClick={handleStartOver}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Start Over
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg"
    >
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{currentQuestion.title}</h2>
        <p className="text-gray-600 mb-4">{currentQuestion.subtitle}</p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {currentQuestion.fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.optional && <span className="text-gray-400 text-sm"> (optional)</span>}
              {!field.optional && <span className="text-red-500">*</span>}
            </label>
            {field.type === 'select' ? (
              <select
                className={`w-full p-2 border rounded-md ${
                  fieldErrors.some(e => e.field === field.name)
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                value={formData[field.name as keyof FormData] as string}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
              >
                <option value="">Select an option</option>
                {field.options?.map((option: string) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.type === 'checkbox' && field.options ? (
              <div className="space-y-2">
                {field.options.map((option: string) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={(formData.currentStruggles || []).includes(option)}
                      onChange={(e) => {
                        const currentValues = formData.currentStruggles || [];
                        const newValues = e.target.checked
                          ? [...currentValues, option]
                          : currentValues.filter((v) => v !== option);
                        handleInputChange('currentStruggles', newValues);
                      }}
                    />
                    {option}
                  </label>
                ))}
              </div>
            ) : (
              <>
                <input
                  type={field.type}
                  className={`w-full p-2 border rounded-md ${
                    fieldErrors.some(e => e.field === field.name)
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder={field.placeholder}
                  value={formData[field.name as keyof FormData] as string}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                />
                {fieldErrors.some(e => e.field === field.name) && (
                  <p className="text-red-500 text-sm mt-1">
                    {fieldErrors.find(e => e.field === field.name)?.message}
                  </p>
                )}
              </>
            )}
          </div>
        ))}

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded ${
              currentStep === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting
              ? 'Analyzing...'
              : currentStep === questions.length - 1
              ? 'Get My Recommendation'
              : 'Next'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default Questionnaire; 