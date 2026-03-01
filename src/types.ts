export interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes?: number;
  servings?: number;
  calories?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  summary?: string;
  instructions?: string;
  extendedIngredients?: Ingredient[];
  nutrition?: {
    nutrients: Nutrient[];
  };
  analyzedInstructions?: {
    name: string;
    steps: Step[];
  }[];
}

export interface Ingredient {
  id: number;
  original: string;
  name: string;
  amount: number;
  unit: string;
  aisle: string;
}

export interface Nutrient {
  name: string;
  amount: number;
  unit: string;
}

export interface Step {
  number: number;
  step: string;
  ingredients: { name: string }[];
  equipment: { name: string }[];
  length?: { number: number; unit: string };
}

export interface MealPlan {
  [key: string]: {
    breakfast?: Recipe;
    lunch?: Recipe;
    dinner?: Recipe;
  };
}

export interface Product {
  id: number;
  title: string;
  image: string;
  imageType?: string;
}
