import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Recipe, Ingredient } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

if (!SPOONACULAR_API_KEY) {
  console.warn('WARNING: SPOONACULAR_API_KEY is not set in environment variables.');
}

app.use(express.json());

// Helper for TheMealDB fetch
async function mealDBFetch(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`MealDB API error: ${response.status}`);
  }
  return response.json();
}

function mapMealToRecipe(meal: any): Recipe {
  const ingredients: Ingredient[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (name && name.trim()) {
      ingredients.push({
        id: i,
        name: name,
        original: `${measure} ${name}`.trim(),
        amount: 0,
        unit: measure || '',
        aisle: ''
      });
    }
  }

  // Split instructions into steps
  const steps = (meal.strInstructions || '')
    .split(/\r?\n|\. /)
    .filter((s: string) => s.trim().length > 5)
    .map((s: string, i: number) => ({
      number: i + 1,
      step: s.trim().replace(/^\d+\.\s*/, ''),
      ingredients: [],
      equipment: []
    }));

  return {
    id: parseInt(meal.idMeal),
    title: meal.strMeal,
    image: meal.strMealThumb,
    instructions: meal.strInstructions || '',
    extendedIngredients: ingredients,
    summary: meal.strInstructions ? meal.strInstructions.substring(0, 150) + '...' : '',
    readyInMinutes: 30,
    servings: 4,
    difficulty: 'Medium',
    calories: 450,
    analyzedInstructions: [{
      name: '',
      steps: steps
    }],
    nutrition: {
      nutrients: [
        { name: 'Calories', amount: 450, unit: 'kcal' },
        { name: 'Fat', amount: 20, unit: 'g' },
        { name: 'Carbohydrates', amount: 50, unit: 'g' },
        { name: 'Protein', amount: 25, unit: 'g' }
      ]
    }
  };
}

function mapMealSummaryToRecipe(meal: any): Recipe {
  return {
    id: parseInt(meal.idMeal),
    title: meal.strMeal,
    image: meal.strMealThumb,
    readyInMinutes: 30,
    servings: 4,
    difficulty: 'Medium',
    calories: 450
  };
}

// TheMealDB Proxy Routes
app.get('/api/spoon/recipe/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await mealDBFetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    if (data.meals && data.meals[0]) {
      res.json(mapMealToRecipe(data.meals[0]));
    } else {
      res.status(404).json({ error: 'Recipe not found' });
    }
  } catch (error: any) {
    console.error('MealDB Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/spoon/search', async (req, res) => {
  try {
    const { query, cuisine, diet, includeIngredients } = req.query;
    let url = '';
    
    if (query) {
      url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(String(query))}`;
    } else if (includeIngredients) {
      // TheMealDB only supports one ingredient in filter
      const firstIng = String(includeIngredients).split(',')[0];
      url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(firstIng)}`;
    } else if (cuisine) {
      url = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(String(cuisine))}`;
    } else if (diet) {
      // Map common diets to categories
      let category = String(diet);
      if (category.toLowerCase() === 'vegetarian') category = 'Vegetarian';
      if (category.toLowerCase() === 'vegan') category = 'Vegan';
      url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`;
    } else {
      // Default to random or some search
      url = `https://www.themealdb.com/api/json/v1/1/search.php?s=`;
    }

    const data = await mealDBFetch(url);
    const results = (data.meals || []).map(mapMealSummaryToRecipe);
    res.json(results);
  } catch (error: any) {
    console.error('MealDB Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/spoon/random', async (req, res) => {
  try {
    // TheMealDB random.php only returns one meal. 
    // We can fetch multiple times or just return a few from a search.
    const data = await mealDBFetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=`);
    const results = (data.meals || []).slice(0, 4).map(mapMealSummaryToRecipe);
    res.json(results);
  } catch (error: any) {
    console.error('MealDB Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
