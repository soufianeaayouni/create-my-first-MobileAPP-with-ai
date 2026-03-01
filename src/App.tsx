import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import Ingredients from './pages/Ingredients';
import Products from './pages/Products';
import RecipeDetails from './pages/RecipeDetails';
import CookMode from './pages/CookMode';
import Planner from './pages/Planner';
import GroceryList from './pages/GroceryList';
import AIChat from './pages/AIChat';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/ingredients" element={<Ingredients />} />
          <Route path="/products" element={<Products />} />
          <Route path="/recipe/:id" element={<RecipeDetails />} />
          <Route path="/cook/:id" element={<CookMode />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/grocery" element={<GroceryList />} />
          <Route path="/chat" element={<AIChat />} />
        </Routes>
      </Layout>
    </Router>
  );
}
