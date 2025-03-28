import React from 'react';
import Questionnaire from './components/Questionnaire';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          2Iron Golf Club Selector
        </h1>
        <p className="text-xl text-gray-600">
          Find out if a 2-iron is the right club for your game
        </p>
      </div>
      <Questionnaire />
    </div>
  );
}
