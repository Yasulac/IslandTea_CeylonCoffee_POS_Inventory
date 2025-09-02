import { db } from '../../firebaseConfig';
import { 
  collection, doc, addDoc, setDoc, updateDoc, deleteDoc, getDoc, getDocs, onSnapshot, serverTimestamp, writeBatch, query, where, orderBy
} from 'firebase/firestore';

// Collections
const productsCol = collection(db, 'products');
const recipesCol = collection(db, 'recipes');

// Real-time subscription to products
export const subscribeToProducts = (onChange) => {
  return onSnapshot(productsCol, (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    onChange(items);
  });
};

// Add new product (finished product)
export const addProduct = async (product) => {
  const data = {
    name: product.name,
    sku: product.sku,
    description: product.description || '',
    price: product.price,
    cost: product.cost || 0,
    category: product.category || 'Beverage',
    subcategory: product.subcategory || '',
    status: product.status || 'active',
    hasRecipe: product.hasRecipe || false, // Whether this product has a BOM/recipe
    recipeId: product.recipeId || null, // Reference to recipe if hasRecipe is true
    imageUrl: product.imageUrl || '',
    preparationTime: product.preparationTime || 0, // in minutes
    allergens: product.allergens || [],
    nutritionalInfo: product.nutritionalInfo || {},
    tags: product.tags || [],
    notes: product.notes || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  // Use SKU as document ID for easier reference
  const docRef = doc(db, 'products', product.sku);
  await setDoc(docRef, data);
  return product.sku;
};

// Update product
export const updateProduct = async (productId, updates) => {
  const ref = doc(db, 'products', productId);
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
};

// Get product by SKU
export const getProductBySKU = async (sku) => {
  try {
    const docRef = doc(db, 'products', sku);
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

// Get product by ID
export const getProductById = async (productId) => {
  try {
    const docRef = doc(db, 'products', productId);
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

// Get all products
export const getAllProducts = async () => {
  try {
    const querySnapshot = await getDocs(productsCol);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Get products by category
export const getProductsByCategory = async (category) => {
  try {
    const q = query(
      productsCol,
      where('category', '==', category),
      where('status', '==', 'active'),
      orderBy('name', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

// Get products with recipes
export const getProductsWithRecipes = async () => {
  try {
    const q = query(
      productsCol,
      where('hasRecipe', '==', true),
      where('status', '==', 'active'),
      orderBy('name', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching products with recipes:', error);
    throw error;
  }
};

// Get products without recipes (simple products)
export const getProductsWithoutRecipes = async () => {
  try {
    const q = query(
      productsCol,
      where('hasRecipe', '==', false),
      where('status', '==', 'active'),
      orderBy('name', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching products without recipes:', error);
    throw error;
  }
};

// Search products
export const searchProducts = async (searchTerm) => {
  try {
    const allProducts = await getAllProducts();
    const term = searchTerm.toLowerCase();
    
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(term) ||
      product.sku.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term)
    );
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

// Delete product
export const deleteProduct = async (productId) => {
  try {
    const docRef = doc(db, 'products', productId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Get product with recipe details
export const getProductWithRecipe = async (productSku) => {
  try {
    const product = await getProductBySKU(productSku);
    if (!product) {
      return null;
    }
    
    if (product.hasRecipe && product.recipeId) {
      // Get recipe details
      const recipeDoc = await getDoc(doc(db, 'recipes', product.recipeId));
      if (recipeDoc.exists()) {
        product.recipe = { id: recipeDoc.id, ...recipeDoc.data() };
      }
    }
    
    return product;
  } catch (error) {
    console.error('Error fetching product with recipe:', error);
    throw error;
  }
};

// Check product availability (for products with recipes)
export const checkProductAvailability = async (productSku, quantity = 1) => {
  try {
    const product = await getProductBySKU(productSku);
    if (!product) {
      throw new Error(`Product ${productSku} not found`);
    }
    
    if (!product.hasRecipe) {
      // Simple product - always available
      return {
        available: true,
        canMake: quantity,
        reason: 'Simple product - no recipe required'
      };
    }
    
    // Check recipe availability
    const recipe = await getRecipeById(product.recipeId);
    if (!recipe) {
      return {
        available: false,
        canMake: 0,
        reason: 'Recipe not found'
      };
    }
    
    const availability = await checkRecipeAvailability(recipe.id, quantity);
    
    return {
      available: availability.canMake,
      canMake: availability.canMake ? quantity : 0,
      missingIngredients: availability.missingIngredients,
      insufficientIngredients: availability.insufficientIngredients,
      totalCost: availability.totalCost,
      reason: availability.canMake ? 'All ingredients available' : 'Insufficient ingredients'
    };
  } catch (error) {
    console.error('Error checking product availability:', error);
    throw error;
  }
};

// Import helper functions
const getRecipeById = async (recipeId) => {
  try {
    const docRef = doc(db, 'recipes', recipeId);
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return null;
  }
};

const checkRecipeAvailability = async (recipeId, quantity = 1) => {
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


