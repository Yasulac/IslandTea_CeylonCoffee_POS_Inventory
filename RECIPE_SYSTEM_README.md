# Recipe-Based Inventory System Documentation

## Overview
The POS system now implements a sophisticated recipe-based inventory management system that separates raw materials (inventory) from finished products and connects them through Bill of Materials (BOM) recipes. This allows for accurate inventory tracking and automatic deduction when products are sold.

## System Architecture

### 1. Three-Tier Structure

#### **Inventory (Raw Materials)**
- **Collection**: `inventory`
- **Purpose**: Raw materials and ingredients used in recipes
- **Examples**: Tea leaves, coffee beans, milk, sugar, spices
- **Key Fields**:
  - `sku`: Unique identifier
  - `name`: Item name
  - `currentStock`: Available quantity
  - `unit`: Measurement unit (kg, liters, pieces, etc.)
  - `costPerUnit`: Cost per unit
  - `minStockLevel`: Reorder threshold
  - `status`: 'active' or 'low-stock'

#### **Products (Finished Goods)**
- **Collection**: `products`
- **Purpose**: Final products sold to customers
- **Examples**: Ceylon Black Tea, Vanilla Latte, Milk Tea
- **Key Fields**:
  - `sku`: Unique identifier
  - `name`: Product name
  - `price`: Selling price
  - `hasRecipe`: Boolean indicating if product has a BOM
  - `recipeId`: Reference to recipe document
  - `category`: Product category

#### **Recipes (Bill of Materials)**
- **Collection**: `recipes`
- **Purpose**: Defines ingredients and quantities needed for each product
- **Key Fields**:
  - `productSku`: Links to the product
  - `ingredients`: Array of required ingredients with quantities
  - `yield`: Number of units produced per recipe
  - `instructions`: Preparation steps

### 2. Data Flow

```
Customer Order → Product Selection → Recipe Lookup → Inventory Consumption → Stock Update
```

## Features Implemented

### 1. Automatic Inventory Management
- **Real-time Stock Updates**: When a product with a recipe is sold, the system automatically deducts the required ingredients from inventory
- **Batch Processing**: All inventory updates are processed in a single transaction for data consistency
- **Stock Level Monitoring**: Automatic status updates when items fall below minimum stock levels

### 2. Recipe Management
- **Ingredient Tracking**: Each recipe specifies exact quantities of ingredients needed
- **Cost Calculation**: Automatic calculation of product costs based on ingredient costs
- **Availability Checking**: System can check if sufficient ingredients are available before allowing sales

### 3. Sales Processing
- **Recipe Integration**: Sales automatically trigger inventory consumption for products with recipes
- **Transaction Logging**: All inventory adjustments are logged with reasons and timestamps
- **Error Handling**: Graceful handling of insufficient inventory scenarios

### 4. Reporting and Analytics
- **Inventory Consumption Reports**: Track which ingredients are consumed over time
- **Cost Analysis**: Calculate actual product costs based on current ingredient prices
- **Stock Level Alerts**: Dashboard shows low stock items from inventory collection

## Database Collections

### 1. `inventory` Collection
```javascript
{
  sku: "TEA001",
  name: "Ceylon Black Tea Leaves",
  currentStock: 25,
  unit: "kg",
  costPerUnit: 120.00,
  supplier: "Ceylon Tea Suppliers",
  category: "Tea",
  minStockLevel: 5,
  maxStockLevel: 50,
  status: "active",
  location: "Warehouse A",
  notes: "Premium Ceylon black tea leaves",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 2. `products` Collection
```javascript
{
  sku: "PROD001",
  name: "Ceylon Black Tea",
  description: "Traditional Ceylon black tea served hot",
  price: 120.00,
  cost: 0, // Calculated from recipe
  category: "Tea",
  subcategory: "Hot Tea",
  status: "active",
  hasRecipe: true,
  recipeId: "PROD001",
  preparationTime: 3,
  allergens: [],
  nutritionalInfo: { calories: 0, caffeine: "medium" },
  tags: ["hot", "traditional", "ceylon"],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 3. `recipes` Collection
```javascript
{
  productSku: "PROD001",
  name: "Ceylon Black Tea Recipe",
  productName: "Ceylon Black Tea",
  description: "Traditional Ceylon black tea preparation",
  ingredients: [
    { sku: "TEA001", name: "Ceylon Black Tea Leaves", quantity: 0.01, unit: "kg" },
    { sku: "SUGAR001", name: "Sugar", quantity: 0.01, unit: "kg" }
  ],
  yield: 1,
  preparationTime: 3,
  instructions: "1. Boil water\n2. Add tea leaves\n3. Steep for 3 minutes\n4. Add sugar to taste",
  costPerUnit: 0, // Calculated
  status: "active",
  category: "Tea",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 4. `sales` Collection (Enhanced)
```javascript
{
  saleId: "SALE-20241201-143022-001",
  items: [
    {
      productId: "PROD001",
      sku: "PROD001",
      name: "Ceylon Black Tea",
      price: 120.00,
      quantity: 2,
      hasRecipe: true,
      recipeId: "PROD001"
    }
  ],
  total: 240.00,
  paymentMethod: "Cash",
  amountReceived: 250.00,
  referenceNumber: "",
  inventoryConsumed: [
    {
      productSku: "PROD001",
      productName: "Ceylon Black Tea",
      quantity: 2,
      recipeId: "PROD001",
      recipeName: "Ceylon Black Tea Recipe",
      consumedIngredients: [
        {
          sku: "TEA001",
          name: "Ceylon Black Tea Leaves",
          quantity: 0.02,
          unit: "kg",
          previousStock: 25,
          newStock: 24.98
        },
        {
          sku: "SUGAR001",
          name: "Sugar",
          quantity: 0.02,
          unit: "kg",
          previousStock: 50,
          newStock: 49.98
        }
      ]
    }
  ],
  createdAt: Timestamp,
  date: "2024-12-01T14:30:22.000Z"
}
```

### 5. `inventory_adjustments` Collection
```javascript
{
  sku: "TEA001",
  itemName: "Ceylon Black Tea Leaves",
  previousStock: 25,
  newStock: 24.98,
  quantity: 0.02,
  operation: "subtract",
  reason: "Sale consumption: Ceylon Black Tea Recipe",
  recipeId: "PROD001",
  adjustedBy: "system",
  timestamp: Timestamp,
  createdAt: Timestamp
}
```

## Service Files

### 1. `components/services/inventory.js`
- **Purpose**: Manages raw materials/inventory items
- **Key Functions**:
  - `addInventoryItem()`: Add new inventory item
  - `updateInventoryItem()`: Update inventory details
  - `adjustInventoryStock()`: Adjust stock levels
  - `getLowStockInventory()`: Get items below minimum stock
  - `consumeInventoryFromRecipe()`: Bulk consume inventory from recipe

### 2. `components/services/products.js`
- **Purpose**: Manages finished products
- **Key Functions**:
  - `addProduct()`: Add new product
  - `getProductsWithRecipes()`: Get products that have BOMs
  - `getProductsWithoutRecipes()`: Get simple products
  - `checkProductAvailability()`: Check if product can be made

### 3. `components/services/recipes.js`
- **Purpose**: Manages Bill of Materials
- **Key Functions**:
  - `addRecipe()`: Add new recipe
  - `calculateRecipeCost()`: Calculate cost based on ingredients
  - `checkRecipeAvailability()`: Check ingredient availability
  - `getRecipesByIngredient()`: Find recipes using specific ingredient

### 4. `components/services/sales.js`
- **Purpose**: Handles sales with inventory consumption
- **Key Functions**:
  - `processSaleAndConsumeInventory()`: Process sale and deduct inventory
  - `getInventoryConsumptionReport()`: Generate consumption reports
  - `getTopSellingProducts()`: Get best-selling products

## How It Works

### 1. Product Setup
1. **Add Inventory Items**: Create raw materials with SKUs, costs, and stock levels
2. **Create Products**: Define finished products with prices and categories
3. **Create Recipes**: Link products to their required ingredients and quantities

### 2. Sales Process
1. **Customer Orders**: Customer selects products from POS
2. **Recipe Lookup**: System checks if product has a recipe
3. **Availability Check**: Verify sufficient ingredients are available
4. **Inventory Consumption**: Automatically deduct ingredients from inventory
5. **Transaction Recording**: Log sale with inventory consumption details

### 3. Inventory Management
1. **Stock Monitoring**: Real-time tracking of inventory levels
2. **Low Stock Alerts**: Automatic alerts when items fall below minimum
3. **Adjustment Logging**: All stock changes are logged with reasons
4. **Cost Tracking**: Automatic cost calculation based on ingredient prices

## Sample Data

### Inventory Items (10 items)
- **Tea**: Ceylon Black Tea Leaves, Green Tea Leaves
- **Coffee**: Arabica Coffee Beans, Robusta Coffee Beans
- **Dairy**: Fresh Milk, Condensed Milk
- **Sweeteners**: Sugar, Honey
- **Flavors**: Vanilla Extract, Cinnamon Powder

### Products (10 items)
- **With Recipes**: Ceylon Black Tea, Green Tea, Arabica Coffee, Robusta Coffee, Milk Tea, Vanilla Latte, Honey Tea, Cinnamon Coffee
- **Simple Products**: Bottled Water, Canned Soda

### Recipes (8 recipes)
- Each recipe specifies exact quantities of ingredients needed
- Includes preparation instructions and yield information

## Benefits

### 1. Accurate Inventory Tracking
- Real-time stock levels for all ingredients
- Automatic deduction when products are sold
- Comprehensive audit trail of all inventory changes

### 2. Cost Management
- Accurate product cost calculation based on current ingredient prices
- Profit margin analysis
- Cost variance tracking

### 3. Operational Efficiency
- Automated inventory management reduces manual errors
- Real-time availability checking prevents overselling
- Streamlined recipe management

### 4. Business Intelligence
- Detailed consumption reports
- Ingredient usage analytics
- Cost analysis and optimization opportunities

## Usage Instructions

### 1. Setup
```javascript
// Import and run the setup script
import addRecipeSystemData from './setup-recipe-system-data.js';
addRecipeSystemData();
```

### 2. Adding New Products
```javascript
// 1. Add inventory items first
await addInventoryItem({
  name: "New Ingredient",
  sku: "ING001",
  currentStock: 100,
  unit: "kg",
  costPerUnit: 50.00
});

// 2. Create product
await addProduct({
  name: "New Product",
  sku: "PROD011",
  price: 150.00,
  hasRecipe: true,
  recipeId: "PROD011"
});

// 3. Create recipe
await addRecipe({
  productSku: "PROD011",
  ingredients: [
    { sku: "ING001", name: "New Ingredient", quantity: 0.05, unit: "kg" }
  ]
});
```

### 3. Processing Sales
```javascript
// Sales automatically consume inventory
await processSaleAndConsumeInventory({
  cartItems: [
    {
      sku: "PROD001",
      name: "Ceylon Black Tea",
      price: 120.00,
      quantity: 2,
      hasRecipe: true,
      recipeId: "PROD001"
    }
  ],
  payment: {
    paymentMethod: "Cash",
    amountReceived: 250.00
  }
});
```

## Troubleshooting

### Common Issues

1. **Insufficient Inventory**
   - Check current stock levels in inventory collection
   - Verify recipe quantities are reasonable
   - Add more inventory items

2. **Missing Recipes**
   - Ensure products with `hasRecipe: true` have corresponding recipes
   - Check that `recipeId` matches the recipe document ID

3. **Cost Calculation Errors**
   - Verify all ingredients have `costPerUnit` values
   - Check that recipe quantities are in correct units

4. **Stock Level Issues**
   - Review `minStockLevel` settings
   - Check inventory adjustment logs for errors

### Debug Information
- All inventory operations are logged in `inventory_adjustments` collection
- Sales include detailed `inventoryConsumed` information
- Console logs provide detailed operation tracking

## Future Enhancements

### Potential Improvements
1. **Batch Recipe Processing**: Process multiple recipes simultaneously
2. **Ingredient Substitution**: Allow ingredient alternatives in recipes
3. **Waste Tracking**: Track ingredient waste and spoilage
4. **Supplier Management**: Integrate supplier information and ordering
5. **Recipe Scaling**: Automatically scale recipes for different batch sizes
6. **Nutritional Analysis**: Calculate nutritional information from ingredients
7. **Allergen Tracking**: Automatic allergen detection from ingredients
8. **Seasonal Recipes**: Support for seasonal ingredient variations

## Support

For issues or questions about the recipe-based inventory system:
1. Check the browser console for error messages
2. Verify all collections exist in Firestore
3. Ensure proper data relationships between products, recipes, and inventory
4. Review inventory adjustment logs for detailed operation history
5. Test with sample data to isolate issues


