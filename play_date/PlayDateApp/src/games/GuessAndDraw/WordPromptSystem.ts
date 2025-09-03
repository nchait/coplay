export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface WordPrompt {
  word: string;
  difficulty: DifficultyLevel;
  category: string;
  hints?: string[];
}

// Word banks organized by difficulty and category
const WORD_BANKS: Record<DifficultyLevel, Record<string, string[]>> = {
  easy: {
    animals: [
      'cat', 'dog', 'fish', 'bird', 'cow', 'pig', 'duck', 'frog', 
      'bee', 'ant', 'owl', 'fox', 'bear', 'lion', 'tiger', 'mouse'
    ],
    objects: [
      'car', 'house', 'tree', 'sun', 'moon', 'star', 'ball', 'book',
      'cup', 'hat', 'shoe', 'key', 'door', 'window', 'chair', 'table'
    ],
    food: [
      'apple', 'banana', 'pizza', 'cake', 'bread', 'egg', 'milk', 'ice cream',
      'cookie', 'candy', 'orange', 'grape', 'cheese', 'fish', 'chicken', 'rice'
    ],
    nature: [
      'flower', 'grass', 'cloud', 'rain', 'snow', 'wind', 'fire', 'water',
      'mountain', 'beach', 'forest', 'river', 'lake', 'ocean', 'desert', 'island'
    ]
  },
  medium: {
    animals: [
      'elephant', 'giraffe', 'penguin', 'dolphin', 'butterfly', 'spider', 'snake', 'turtle',
      'rabbit', 'horse', 'sheep', 'goat', 'zebra', 'kangaroo', 'monkey', 'whale'
    ],
    objects: [
      'bicycle', 'airplane', 'computer', 'telephone', 'camera', 'guitar', 'piano', 'umbrella',
      'backpack', 'glasses', 'watch', 'scissors', 'hammer', 'ladder', 'bridge', 'castle'
    ],
    activities: [
      'swimming', 'dancing', 'singing', 'reading', 'writing', 'cooking', 'painting', 'running',
      'jumping', 'sleeping', 'eating', 'playing', 'working', 'studying', 'shopping', 'traveling'
    ],
    emotions: [
      'happy', 'sad', 'angry', 'excited', 'surprised', 'scared', 'confused', 'proud',
      'tired', 'hungry', 'thirsty', 'cold', 'hot', 'sick', 'healthy', 'strong'
    ]
  },
  hard: {
    abstract: [
      'freedom', 'justice', 'peace', 'love', 'friendship', 'courage', 'wisdom', 'hope',
      'dream', 'memory', 'imagination', 'creativity', 'inspiration', 'motivation', 'ambition', 'success'
    ],
    complex_objects: [
      'microscope', 'telescope', 'stethoscope', 'calculator', 'thermometer', 'compass', 'hourglass', 'lighthouse',
      'windmill', 'satellite', 'submarine', 'helicopter', 'parachute', 'escalator', 'elevator', 'fountain'
    ],
    professions: [
      'doctor', 'teacher', 'engineer', 'artist', 'musician', 'chef', 'pilot', 'scientist',
      'lawyer', 'architect', 'photographer', 'journalist', 'firefighter', 'police officer', 'nurse', 'farmer'
    ],
    concepts: [
      'gravity', 'electricity', 'magnetism', 'evolution', 'democracy', 'economy', 'culture', 'tradition',
      'technology', 'innovation', 'communication', 'transportation', 'education', 'entertainment', 'celebration', 'ceremony'
    ]
  }
};

// Hints for difficult words
const WORD_HINTS: Record<string, string[]> = {
  // Abstract concepts
  'freedom': ['Not being controlled', 'Liberty', 'Independence'],
  'justice': ['Fairness', 'What\'s right', 'Court decision'],
  'peace': ['No war', 'Calm', 'Harmony'],
  'imagination': ['Creative thinking', 'Fantasy', 'Dreams'],
  
  // Complex objects
  'microscope': ['Makes small things big', 'Science tool', 'Lab equipment'],
  'telescope': ['Look at stars', 'Space viewing', 'Astronomy tool'],
  'lighthouse': ['Guides ships', 'Tall tower', 'Ocean beacon'],
  'parachute': ['Slows falling', 'Skydiving gear', 'Emergency equipment'],
  
  // Professions
  'architect': ['Designs buildings', 'Plans structures', 'Blueprint maker'],
  'journalist': ['Writes news', 'Reports stories', 'Media worker'],
  'scientist': ['Does experiments', 'Studies nature', 'Research expert'],
  
  // Concepts
  'gravity': ['Pulls things down', 'Earth\'s force', 'Why things fall'],
  'democracy': ['People vote', 'Government type', 'Majority rules'],
  'evolution': ['Species change', 'Darwin\'s theory', 'Natural selection'],
};

export class WordPromptSystem {
  private usedWords: Set<string> = new Set();
  
  /**
   * Generate a random word prompt based on difficulty level
   */
  generatePrompt(difficulty: DifficultyLevel = 'medium'): WordPrompt {
    const categories = Object.keys(WORD_BANKS[difficulty]);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const wordsInCategory = WORD_BANKS[difficulty][randomCategory];
    
    // Filter out already used words
    const availableWords = wordsInCategory.filter(word => !this.usedWords.has(word));
    
    // If all words in this difficulty have been used, reset the used words set
    if (availableWords.length === 0) {
      this.usedWords.clear();
      return this.generatePrompt(difficulty);
    }
    
    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    this.usedWords.add(randomWord);
    
    return {
      word: randomWord,
      difficulty,
      category: randomCategory,
      hints: WORD_HINTS[randomWord] || [],
    };
  }
  
  /**
   * Generate multiple prompts for the drawer to choose from
   */
  generateChoices(difficulty: DifficultyLevel = 'medium', count: number = 3): WordPrompt[] {
    const choices: WordPrompt[] = [];
    
    for (let i = 0; i < count; i++) {
      choices.push(this.generatePrompt(difficulty));
    }
    
    return choices;
  }
  
  /**
   * Check if a guess matches the target word (case-insensitive, handles plurals)
   */
  isCorrectGuess(guess: string, targetWord: string): boolean {
    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedTarget = targetWord.toLowerCase().trim();
    
    // Exact match
    if (normalizedGuess === normalizedTarget) {
      return true;
    }
    
    // Handle plurals
    if (normalizedGuess === normalizedTarget + 's' || normalizedGuess + 's' === normalizedTarget) {
      return true;
    }
    
    // Handle common variations
    const variations = this.getWordVariations(normalizedTarget);
    return variations.includes(normalizedGuess);
  }
  
  /**
   * Get common variations of a word
   */
  private getWordVariations(word: string): string[] {
    const variations = [word];
    
    // Add plural forms
    if (!word.endsWith('s')) {
      variations.push(word + 's');
    }
    
    // Add common word variations
    const wordVariations: Record<string, string[]> = {
      'car': ['automobile', 'vehicle'],
      'house': ['home', 'building'],
      'dog': ['puppy', 'canine'],
      'cat': ['kitten', 'feline'],
      'happy': ['joy', 'glad', 'cheerful'],
      'sad': ['unhappy', 'depressed', 'down'],
      'big': ['large', 'huge', 'giant'],
      'small': ['tiny', 'little', 'mini'],
    };
    
    if (wordVariations[word]) {
      variations.push(...wordVariations[word]);
    }
    
    return variations;
  }
  
  /**
   * Get a hint for the current word
   */
  getHint(prompt: WordPrompt, hintIndex: number = 0): string | null {
    if (!prompt.hints || hintIndex >= prompt.hints.length) {
      return null;
    }
    
    return prompt.hints[hintIndex];
  }
  
  /**
   * Calculate points based on difficulty and time taken
   */
  calculatePoints(
    difficulty: DifficultyLevel, 
    timeRemaining: number, 
    totalTime: number,
    hintsUsed: number = 0
  ): number {
    const difficultyMultiplier = {
      easy: 1,
      medium: 1.5,
      hard: 2,
    };
    
    const basePoints = 100;
    const timeBonus = (timeRemaining / totalTime) * 50;
    const difficultyBonus = basePoints * difficultyMultiplier[difficulty];
    const hintPenalty = hintsUsed * 10;
    
    return Math.max(10, Math.round(difficultyBonus + timeBonus - hintPenalty));
  }
  
  /**
   * Get difficulty-appropriate time limit
   */
  getTimeLimit(difficulty: DifficultyLevel): number {
    const timeLimits = {
      easy: 60,    // 1 minute
      medium: 90,  // 1.5 minutes
      hard: 120,   // 2 minutes
    };
    
    return timeLimits[difficulty];
  }
  
  /**
   * Reset used words (useful for new game sessions)
   */
  resetUsedWords(): void {
    this.usedWords.clear();
  }
  
  /**
   * Get statistics about available words
   */
  getWordStats(): Record<DifficultyLevel, number> {
    const stats: Record<DifficultyLevel, number> = {
      easy: 0,
      medium: 0,
      hard: 0,
    };
    
    Object.keys(WORD_BANKS).forEach(difficulty => {
      const difficultyLevel = difficulty as DifficultyLevel;
      const categories = WORD_BANKS[difficultyLevel];
      
      Object.values(categories).forEach(words => {
        stats[difficultyLevel] += words.length;
      });
    });
    
    return stats;
  }
}

// Export a singleton instance
export const wordPromptSystem = new WordPromptSystem();

export default WordPromptSystem;
