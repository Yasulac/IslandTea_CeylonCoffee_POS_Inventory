import { db } from '../../firebaseConfig';
import { 
  collection, doc, addDoc, setDoc, updateDoc, deleteDoc, getDoc, getDocs, onSnapshot, serverTimestamp, writeBatch, query, where, orderBy
} from 'firebase/firestore';

// Collections
const recipesCol = collection(db, 'recipes');
const productsCol = collection(db, 'products');
const inventoryCol = collection(db, 'inventory');

// Real-time subscription to recipes
export const subscribeToRecipes = (onChange) => {
  return onSnapshot(recipesCol, (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    onChange(items);
  });
};

// Add new recipe/BOM
export const addRecipe = async (recipe) => {
  const data = {
    name: recipe.name,
    productSku: recipe.productSku, // Links to the product
    productName: recipe.productName,
    description: recipe.description || '',
    ingredients: recipe.ingredients || [], // Array of {sku, name, quantity, unit}
    yield: recipe.yield || 1, // How many units of product this recipe makes
    preparationTime: recipe.preparationTime || 0, // in minutes
    instructions: recipe.instructions || '',
    costPerUnit: recipe.costPerUnit || 0,
    status: recipe.status || 'active',
    category: recipe.category || 'Beverage',
    notes: recipe.notes || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  // Use product SKU as document ID for easier reference
  const docRef = doc(db, 'recipes', recipe.productSku);
  await setDoc(docRef, data);
  return recipe.productSku;
};

// Update recipe
export const updateRecipe = async (recipeId, updates) => {
  const ref = doc(db, 'recipes', recipeId);
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
};

// Get recipe by product SKU
export const getRecipeByProductSKU = async (productSku) => {
  try {
    const docRef = doc(db, 'recipes', productSku);
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    throw error;
  }
};

// Get recipe by ID
export const getRecipeById = async (recipeId) => {
  try {
    const docRef = doc(db, 'recipes', recipeId);
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    throw error;
  }
};

// Get all recipes
export const getAllRecipes = async () => {
  try {
    const querySnapshot = await getDocs(recipesCol);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching recipes:', error);
    throw error;
  }
};

// Calculate recipe cost
export const calculateRecipeCost = async (recipeId) => {
  try {
    const recipe = await getRecipeById(recipeId);
    if (!recipe) {
      throw new Error(`Recipe ${recipeId} not found`);
    }
    
    let totalCost = 0;
    
    for (const ingredient of recipe.ingredients) {
      // Get inventory item to get cost per unit
      const inventoryItem = await getInventoryItemBySKU(ingredient.sku);
      if (inventoryItem) {
        const ingredientCost = inventoryItem.costPerUnit * ingredient.quantity;
        totalCost += ingredientCost;
      }
    }
    
    return totalCost;
  } catch (error) {
    console.error('Error calculating recipe cost:', error);
    throw error;
  }
};

// Check if recipe can be made with current inventory
export const checkRecipeAvailability = async (recipeId, quantity = 1) => {
  try {
    const recipe = await getRecipeById(recipeId);
    if (!recipe) {
      throw new Error(`Recipe ${recipeId} not found`);
    }
    
    const availability = {
      canMake: true,
      missingIngredients: [],
      insufficientIngredients: [],
      totalCost: 0
    };
    
    for (const ingredient of recipe.ingredients) {
      const inventoryItem = await getInventoryItemBySKU(ingredient.sku);
      if (!inventoryItem) {
        availability.canMake = false;
        availability.missingIngredients.push({
          sku: ingredient.sku,
          name: ingredient.name,
          required: ingredient.quantity * quantity,
          available: 0
        });
      } else {
        const requiredQuantity = ingredient.quantity * quantity;
        const availableQuantity = inventoryItem.currentStock;
        
        if (availableQuantity < requiredQuantity) {
          availability.canMake = false;
          availability.insufficientIngredients.push({
            sku: ingredient.sku,
            name: ingredient.name,
            required: requiredQuantity,
            available: availableQuantity,
            shortfall: requiredQuantity - availableQuantity
          });
        }
        
        // Calculate cost
        const ingredientCost = inventoryItem.costPerUnit * requiredQuantity;
        availability.totalCost += ingredientCost;
      }
    }
    
    return availability;
  } catch (error) {
    console.error('Error checking recipe availability:', error);
    throw error;
  }
};

// Get recipes by category
export const getRecipesByCategory = async (category) => {
  try {
    const q = query(
      recipesCol,
      where('category', '==', category),
      orderBy('name', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching recipes by category:', error);
    throw error;
  }
};

// Get recipes that use a specific ingredient
export const getRecipesByIngredient = async (ingredientSku) => {
  try {
    const allRecipes = await getAllRecipes();
    return allRecipes.filter(recipe => 
      recipe.ingredients.some(ingredient => ingredient.sku === ingredientSku)
    );
  } catch (error) {
    console.error('Error fetching recipes by ingredient:', error);
    throw error;
  }
};

// Delete recipe
export const deleteRecipe = async (recipeId) => {
  try {
    const docRef = doc(db, 'recipes', recipeId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
};

// Import helper function
const getInventoryItemBySKU = async (sku) => {
  try {
    const docRef = doc(db, 'inventory', sku);
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return null;
  }
};


