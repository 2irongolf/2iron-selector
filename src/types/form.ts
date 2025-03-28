export interface FormData {
  name: string;
  email: string;
  handicap: string;
  experience: string;
  height: string;
  strength: string;
  swingSpeed: string;
  typicalIronDistances: {
    sevenIron: string;
    fourIron: string;
  };
  playingStyle: string;
  currentStruggles: string[];
  practiceFrequency: string;
} 