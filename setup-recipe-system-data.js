// setup-recipe-system-data.js
import { db } from './firebaseConfig';
import { collection, setDoc, doc, serverTimestamp } from 'firebase/firestore';

const addRecipeSystemData = async () => {
  try {
    console.log('Setting up Recipe-Based Inventory System data...');

    // 1. Add Inventory Items (Raw Materials)
    const inventoryCol = collection(db, 'inventory');
    
    const inventoryItems = [
      {
        name: 'Ceylon Black Tea Leaves',
        sku: 'TEA001',
        currentStock: 25,
        unit: 'kg',
        costPerUnit: 120.00,
        supplier: 'Ceylon Tea Suppliers',
        category: 'Tea',
        minStockLevel: 5,
        maxStockLevel: 50,
        status: 'active',
        location: 'Warehouse A',
        notes: 'Premium Ceylon black tea leaves'
      },
      {
        name: 'Arabica Coffee Beans',
        sku: 'COF001',
        currentStock: 30,
        unit: 'kg',
        costPerUnit: 180.00,
        supplier: 'Coffee Bean Co.',
        category: 'Coffee',
        minStockLevel: 8,
        maxStockLevel: 60,
        status: 'active',
        location: 'Warehouse A',
        notes: 'High-quality Arabica beans'
      },
      {
        name: 'Robusta Coffee Beans',
        sku: 'COF002',
        currentStock: 20,
        unit: 'kg',
        costPerUnit: 140.00,
        supplier: 'Coffee Bean Co.',
        category: 'Coffee',
        minStockLevel: 5,
        maxStockLevel: 40,
        status: 'active',
        location: 'Warehouse A',
        notes: 'Strong Robusta beans'
      },
      {
        name: 'Green Tea Leaves',
        sku: 'TEA002',
        currentStock: 15,
        unit: 'kg',
        costPerUnit: 95.00,
        supplier: 'Ceylon Tea Suppliers',
        category: 'Tea',
        minStockLevel: 3,
        maxStockLevel: 30,
        status: 'active',
        location: 'Warehouse A',
        notes: 'Organic green tea leaves'
      },
      {
        name: 'Fresh Milk',
        sku: 'MILK001',
        currentStock: 40,
        unit: 'liters',
        costPerUnit: 45.00,
        supplier: 'Dairy Farm Co.',
        category: 'Dairy',
        minStockLevel: 10,
        maxStockLevel: 80,
        status: 'active',
        location: 'Refrigerator',
        notes: 'Fresh whole milk'
      },
      {
        name: 'Condensed Milk',
        sku: 'MILK002',
        currentStock: 8,
        unit: 'cans',
        costPerUnit: 35.00,
        supplier: 'Dairy Farm Co.',
        category: 'Dairy',
        minStockLevel: 5,
        maxStockLevel: 20,
        status: 'low-stock',
        location: 'Warehouse B',
        notes: 'Sweetened condensed milk'
      },
      {
        name: 'Sugar',
        sku: 'SUGAR001',
        currentStock: 50,
        unit: 'kg',
        costPerUnit: 25.00,
        supplier: 'Sugar Suppliers',
        category: 'Sweeteners',
        minStockLevel: 10,
        maxStockLevel: 100,
        status: 'active',
        location: 'Warehouse B',
        notes: 'White granulated sugar'
      },
      {
        name: 'Honey',
        sku: 'HONEY001',
        currentStock: 12,
        unit: 'liters',
        costPerUnit: 120.00,
        supplier: 'Local Honey Farm',
        category: 'Sweeteners',
        minStockLevel: 3,
        maxStockLevel: 25,
        status: 'active',
        location: 'Warehouse B',
        notes: 'Pure natural honey'
      },
      {
        name: 'Vanilla Extract',
        sku: 'VANILLA001',
        currentStock: 5,
        unit: 'liters',
        costPerUnit: 200.00,
        supplier: 'Flavor Suppliers',
        category: 'Flavors',
        minStockLevel: 2,
        maxStockLevel: 10,
        status: 'low-stock',
        location: 'Warehouse B',
        notes: 'Pure vanilla extract'
      },
      {
        name: 'Cinnamon Powder',
        sku: 'SPICE001',
        currentStock: 8,
        unit: 'kg',
        costPerUnit: 80.00,
        supplier: 'Spice Suppliers',
        category: 'Spices',
        minStockLevel: 2,
        maxStockLevel: 15,
        status: 'low-stock',
        location: 'Warehouse B',
        notes: 'Ground cinnamon powder'
      }
    ];

    for (const item of inventoryItems) {
      await setDoc(doc(inventoryCol, item.sku), {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`Added inventory item: ${item.name}`);
    }

    // 2. Add Products (Finished Products)
    const productsCol = collection(db, 'products');
    
    const products = [
      {
        name: 'Ceylon Black Tea',
        sku: 'PROD001',
        description: 'Traditional Ceylon black tea served hot',
        price: 120.00,
        cost: 0, // Will be calculated from recipe
        category: 'Tea',
        subcategory: 'Hot Tea',
        status: 'active',
        hasRecipe: true,
        recipeId: 'PROD001', // Links to recipe
        preparationTime: 3,
        allergens: [],
        nutritionalInfo: { calories: 0, caffeine: 'medium' },
        tags: ['hot', 'traditional', 'ceylon']
      },
      {
        name: 'Green Tea',
        sku: 'PROD002',
        description: 'Refreshing green tea with health benefits',
        price: 95.00,
        cost: 0,
        category: 'Tea',
        subcategory: 'Hot Tea',
        status: 'active',
        hasRecipe: true,
        recipeId: 'PROD002',
        preparationTime: 3,
        allergens: [],
        nutritionalInfo: { calories: 0, caffeine: 'low' },
        tags: ['hot', 'healthy', 'green']
      },
      {
        name: 'Arabica Coffee',
        sku: 'PROD003',
        description: 'Smooth Arabica coffee with rich flavor',
        price: 150.00,
        cost: 0,
        category: 'Coffee',
        subcategory: 'Hot Coffee',
        status: 'active',
        hasRecipe: true,
        recipeId: 'PROD003',
        preparationTime: 5,
        allergens: [],
        nutritionalInfo: { calories: 5, caffeine: 'high' },
        tags: ['hot', 'arabica', 'smooth']
      },
      {
        name: 'Robusta Coffee',
        sku: 'PROD004',
        description: 'Strong Robusta coffee with bold taste',
        price: 130.00,
        cost: 0,
        category: 'Coffee',
        subcategory: 'Hot Coffee',
        status: 'active',
        hasRecipe: true,
        recipeId: 'PROD004',
        preparationTime: 5,
        allergens: [],
        nutritionalInfo: { calories: 5, caffeine: 'very high' },
        tags: ['hot', 'robusta', 'strong']
      },
      {
        name: 'Milk Tea',
        sku: 'PROD005',
        description: 'Ceylon tea with fresh milk',
        price: 140.00,
        cost: 0,
        category: 'Tea',
        subcategory: 'Milk Tea',
        status: 'active',
        hasRecipe: true,
        recipeId: 'PROD005',
        preparationTime: 4,
        allergens: ['milk'],
        nutritionalInfo: { calories: 80, caffeine: 'medium' },
        tags: ['hot', 'milk', 'creamy']
      },
      {
        name: 'Vanilla Latte',
        sku: 'PROD006',
        description: 'Arabica coffee with milk and vanilla',
        price: 180.00,
        cost: 0,
        category: 'Coffee',
        subcategory: 'Specialty Coffee',
        status: 'active',
        hasRecipe: true,
        recipeId: 'PROD006',
        preparationTime: 6,
        allergens: ['milk'],
        nutritionalInfo: { calories: 120, caffeine: 'high' },
        tags: ['hot', 'vanilla', 'latte']
      },
      {
        name: 'Honey Tea',
        sku: 'PROD007',
        description: 'Green tea sweetened with natural honey',
        price: 110.00,
        cost: 0,
        category: 'Tea',
        subcategory: 'Hot Tea',
        status: 'active',
        hasRecipe: true,
        recipeId: 'PROD007',
        preparationTime: 4,
        allergens: [],
        nutritionalInfo: { calories: 60, caffeine: 'low' },
        tags: ['hot', 'honey', 'natural']
      },
      {
        name: 'Cinnamon Coffee',
        sku: 'PROD008',
        description: 'Robusta coffee with cinnamon spice',
        price: 160.00,
        cost: 0,
        category: 'Coffee',
        subcategory: 'Specialty Coffee',
        status: 'active',
        hasRecipe: true,
        recipeId: 'PROD008',
        preparationTime: 6,
        allergens: [],
        nutritionalInfo: { calories: 10, caffeine: 'very high' },
        tags: ['hot', 'cinnamon', 'spiced']
      },
      {
        name: 'Bottled Water',
        sku: 'PROD009',
        description: 'Pure bottled water',
        price: 25.00,
        cost: 15.00,
        category: 'Beverages',
        subcategory: 'Water',
        status: 'active',
        hasRecipe: false, // Simple product, no recipe needed
        recipeId: null,
        preparationTime: 0,
        allergens: [],
        nutritionalInfo: { calories: 0, caffeine: 'none' },
        tags: ['cold', 'water', 'pure']
      },
      {
        name: 'Canned Soda',
        sku: 'PROD010',
        description: 'Carbonated soft drink',
        price: 35.00,
        cost: 20.00,
        category: 'Beverages',
        subcategory: 'Soft Drinks',
        status: 'active',
        hasRecipe: false, // Simple product, no recipe needed
        recipeId: null,
        preparationTime: 0,
        allergens: [],
        nutritionalInfo: { calories: 150, caffeine: 'medium' },
        tags: ['cold', 'carbonated', 'sweet']
      }
    ];

    for (const product of products) {
      await setDoc(doc(productsCol, product.sku), {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`Added product: ${product.name}`);
    }

    // 3. Add Recipes (Bill of Materials)
    const recipesCol = collection(db, 'recipes');
    
    const recipes = [
      {
        name: 'Ceylon Black Tea Recipe',
        productSku: 'PROD001',
        productName: 'Ceylon Black Tea',
        description: 'Traditional Ceylon black tea preparation',
        ingredients: [
          { sku: 'TEA001', name: 'Ceylon Black Tea Leaves', quantity: 0.01, unit: 'kg' },
          { sku: 'SUGAR001', name: 'Sugar', quantity: 0.01, unit: 'kg' }
        ],
        yield: 1,
        preparationTime: 3,
        instructions: '1. Boil water\n2. Add tea leaves\n3. Steep for 3 minutes\n4. Add sugar to taste',
        costPerUnit: 0, // Will be calculated
        status: 'active',
        category: 'Tea'
      },
      {
        name: 'Green Tea Recipe',
        productSku: 'PROD002',
        productName: 'Green Tea',
        description: 'Refreshing green tea preparation',
        ingredients: [
          { sku: 'TEA002', name: 'Green Tea Leaves', quantity: 0.008, unit: 'kg' }
        ],
        yield: 1,
        preparationTime: 3,
        instructions: '1. Heat water to 80°C\n2. Add green tea leaves\n3. Steep for 2 minutes',
        costPerUnit: 0,
        status: 'active',
        category: 'Tea'
      },
      {
        name: 'Arabica Coffee Recipe',
        productSku: 'PROD003',
        productName: 'Arabica Coffee',
        description: 'Smooth Arabica coffee preparation',
        ingredients: [
          { sku: 'COF001', name: 'Arabica Coffee Beans', quantity: 0.02, unit: 'kg' },
          { sku: 'SUGAR001', name: 'Sugar', quantity: 0.01, unit: 'kg' }
        ],
        yield: 1,
        preparationTime: 5,
        instructions: '1. Grind coffee beans\n2. Brew with hot water\n3. Add sugar to taste',
        costPerUnit: 0,
        status: 'active',
        category: 'Coffee'
      },
      {
        name: 'Robusta Coffee Recipe',
        productSku: 'PROD004',
        productName: 'Robusta Coffee',
        description: 'Strong Robusta coffee preparation',
        ingredients: [
          { sku: 'COF002', name: 'Robusta Coffee Beans', quantity: 0.025, unit: 'kg' },
          { sku: 'SUGAR001', name: 'Sugar', quantity: 0.01, unit: 'kg' }
        ],
        yield: 1,
        preparationTime: 5,
        instructions: '1. Grind coffee beans\n2. Brew with hot water\n3. Add sugar to taste',
        costPerUnit: 0,
        status: 'active',
        category: 'Coffee'
      },
      {
        name: 'Milk Tea Recipe',
        productSku: 'PROD005',
        productName: 'Milk Tea',
        description: 'Ceylon tea with fresh milk',
        ingredients: [
          { sku: 'TEA001', name: 'Ceylon Black Tea Leaves', quantity: 0.01, unit: 'kg' },
          { sku: 'MILK001', name: 'Fresh Milk', quantity: 0.2, unit: 'liters' },
          { sku: 'SUGAR001', name: 'Sugar', quantity: 0.015, unit: 'kg' }
        ],
        yield: 1,
        preparationTime: 4,
        instructions: '1. Brew strong tea\n2. Add hot milk\n3. Add sugar to taste',
        costPerUnit: 0,
        status: 'active',
        category: 'Tea'
      },
      {
        name: 'Vanilla Latte Recipe',
        productSku: 'PROD006',
        productName: 'Vanilla Latte',
        description: 'Arabica coffee with milk and vanilla',
        ingredients: [
          { sku: 'COF001', name: 'Arabica Coffee Beans', quantity: 0.02, unit: 'kg' },
          { sku: 'MILK001', name: 'Fresh Milk', quantity: 0.25, unit: 'liters' },
          { sku: 'VANILLA001', name: 'Vanilla Extract', quantity: 0.005, unit: 'liters' },
          { sku: 'SUGAR001', name: 'Sugar', quantity: 0.015, unit: 'kg' }
        ],
        yield: 1,
        preparationTime: 6,
        instructions: '1. Brew espresso\n2. Steam milk\n3. Add vanilla and sugar\n4. Combine',
        costPerUnit: 0,
        status: 'active',
        category: 'Coffee'
      },
      {
        name: 'Honey Tea Recipe',
        productSku: 'PROD007',
        productName: 'Honey Tea',
        description: 'Green tea sweetened with natural honey',
        ingredients: [
          { sku: 'TEA002', name: 'Green Tea Leaves', quantity: 0.008, unit: 'kg' },
          { sku: 'HONEY001', name: 'Honey', quantity: 0.02, unit: 'liters' }
        ],
        yield: 1,
        preparationTime: 4,
        instructions: '1. Brew green tea\n2. Add honey while hot\n3. Stir well',
        costPerUnit: 0,
        status: 'active',
        category: 'Tea'
      },
      {
        name: 'Cinnamon Coffee Recipe',
        productSku: 'PROD008',
        productName: 'Cinnamon Coffee',
        description: 'Robusta coffee with cinnamon spice',
        ingredients: [
          { sku: 'COF002', name: 'Robusta Coffee Beans', quantity: 0.025, unit: 'kg' },
          { sku: 'SPICE001', name: 'Cinnamon Powder', quantity: 0.002, unit: 'kg' },
          { sku: 'SUGAR001', name: 'Sugar', quantity: 0.015, unit: 'kg' }
        ],
        yield: 1,
        preparationTime: 6,
        instructions: '1. Brew coffee\n2. Add cinnamon powder\n3. Add sugar to taste',
        costPerUnit: 0,
        status: 'active',
        category: 'Coffee'
      }
    ];

    for (const recipe of recipes) {
      await setDoc(doc(recipesCol, recipe.productSku), {
        ...recipe,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`Added recipe: ${recipe.name}`);
    }

    console.log('Recipe-Based Inventory System data setup completed!');
    console.log('Inventory items added:', inventoryItems.length);
    console.log('Products added:', products.length);
    console.log('Recipes added:', recipes.length);
    
  } catch (error) {
    console.error('Error setting up recipe system data:', error);
  }
};

// Run the function if this file is executed directly
if (typeof window === 'undefined') {
  addRecipeSystemData();
}

export default addRecipeSystemData;


