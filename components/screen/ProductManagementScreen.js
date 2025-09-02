import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addProduct as addProductService, updateProduct as updateProductService } from '../services/products';
import { addRecipe as addRecipeService } from '../services/recipes';
import { getAllInventoryItems } from '../services/inventory';

const ProductManagementScreen = ({ onBackToDashboard, selectedRole }) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [category, setCategory] = useState('Beverage');
  const [hasRecipe, setHasRecipe] = useState(true);
  const [ingredients, setIngredients] = useState([]); // { sku, name, quantity, unit }
  const [saving, setSaving] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [searchSku, setSearchSku] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const items = await getAllInventoryItems();
        setInventoryItems(items);
      } catch (e) {
        console.error('Failed to load inventory:', e);
      }
    })();
  }, []);

  const inventorySkuToItem = useMemo(() => {
    const map = new Map();
    for (const item of inventoryItems) {
      if (item?.id) map.set(item.id, item);
      if (item?.sku) map.set(item.sku, item);
    }
    return map;
  }, [inventoryItems]);

  const addIngredientRow = (prefillSku = '') => {
    let item = null;
    if (prefillSku) {
      item = inventorySkuToItem.get(prefillSku) || null;
    }
    setIngredients(prev => ([
      ...prev,
      {
        sku: item?.sku || prefillSku || '',
        name: item?.name || '',
        quantity: item ? 1 : '',
        unit: item?.unit || '',
      }
    ]));
  };

  const updateIngredientAt = (index, field, value) => {
    setIngredients(prev => prev.map((ing, i) => {
      if (i !== index) return ing;
      let next = { ...ing, [field]: value };
      if (field === 'sku') {
        const item = inventorySkuToItem.get(String(value).trim());
        if (item) {
          next.name = item.name || next.name;
          next.unit = item.unit || next.unit;
        }
      }
      return next;
    }));
  };

  const removeIngredientAt = (index) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    if (!name.trim()) return 'Product name is required';
    if (!sku.trim()) return 'SKU is required';
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) return 'Price must be a non-negative number';
    const costNum = parseFloat(cost || '0');
    if (isNaN(costNum) || costNum < 0) return 'Cost must be a non-negative number';
    if (hasRecipe) {
      if (ingredients.length === 0) return 'Add at least one ingredient for recipe products';
      for (const ing of ingredients) {
        if (!ing.sku?.trim()) return 'Each ingredient must have a SKU';
        const q = parseFloat(String(ing.quantity));
        if (isNaN(q) || q <= 0) return 'Ingredient quantities must be positive numbers';
      }
    }
    return '';
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      Alert.alert('Validation', error);
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        sku: sku.trim(),
        description: '',
        price: parseFloat(price),
        cost: parseFloat(cost || '0'),
        category: category.trim() || 'Beverage',
        status: 'active',
        hasRecipe: !!hasRecipe,
        recipeId: null,
      };
      await addProductService(payload);

      if (hasRecipe) {
        const recipe = {
          name: `${name.trim()} Recipe`,
          productSku: sku.trim(),
          productName: name.trim(),
          description: '',
          ingredients: ingredients.map(i => ({
            sku: String(i.sku).trim(),
            name: i.name || (inventorySkuToItem.get(String(i.sku).trim())?.name || ''),
            quantity: parseFloat(String(i.quantity)),
            unit: i.unit || (inventorySkuToItem.get(String(i.sku).trim())?.unit || ''),
          })),
          yield: 1,
          preparationTime: 0,
          instructions: '',
          costPerUnit: 0,
          status: 'active',
          category: category.trim() || 'Beverage',
          notes: '',
        };
        const recipeId = await addRecipeService(recipe);
        await updateProductService(sku.trim(), { hasRecipe: true, recipeId });
      }

      Alert.alert('Success', 'Product saved successfully');
      // Reset form
      setName('');
      setSku('');
      setPrice('');
      setCost('');
      setCategory('Beverage');
      setHasRecipe(true);
      setIngredients([]);
    } catch (e) {
      console.error('Save product failed:', e);
      Alert.alert('Error', 'Failed to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const filteredInventory = useMemo(() => {
    const term = searchSku.trim().toLowerCase();
    if (!term) return inventoryItems.slice(0, 10);
    return inventoryItems
      .filter(i => (i.sku || i.id || '').toLowerCase().includes(term) || (i.name || '').toLowerCase().includes(term))
      .slice(0, 20);
  }, [inventoryItems, searchSku]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBackToDashboard} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#6B7280" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Management</Text>
        <View style={{ width: 64 }} />
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Add Product</Text>
        <Text style={styles.subtitle}>Role: {selectedRole || 'User'}</Text>

        <View style={styles.formRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Product Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Vanilla Latte" placeholderTextColor="#9CA3AF" />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>SKU</Text>
            <TextInput style={styles.input} value={sku} onChangeText={setSku} placeholder="e.g. VL001" autoCapitalize="characters" placeholderTextColor="#9CA3AF" />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Category</Text>
            <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="e.g. Coffee" placeholderTextColor="#9CA3AF" />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Price</Text>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor="#9CA3AF" />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Cost</Text>
            <TextInput style={styles.input} value={cost} onChangeText={setCost} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor="#9CA3AF" />
          </View>
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Has Ingredients/Recipe</Text>
          <Switch value={hasRecipe} onValueChange={setHasRecipe} />
        </View>

        {hasRecipe && (
          <View style={styles.recipeCard}>
            <Text style={styles.sectionTitle}>Ingredients (from Inventory)</Text>

            <View style={styles.inventorySearchRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={searchSku}
                onChangeText={setSearchSku}
                placeholder="Search inventory by SKU or name"
                placeholderTextColor="#9CA3AF"
              />
              <View style={{ width: 8 }} />
              <TouchableOpacity style={styles.addFromInventoryBtn} onPress={() => { if (searchSku.trim()) addIngredientRow(searchSku.trim()); }} activeOpacity={0.7}>
                <Ionicons name="add" size={16} color="#8B5CF6" />
                <Text style={styles.addFromInventoryText}>Add by SKU</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.inventoryList} horizontal showsHorizontalScrollIndicator={false}>
              {filteredInventory.map(item => (
                <TouchableOpacity key={item.id} style={styles.inventoryChip} onPress={() => addIngredientRow(item.sku || item.id)} activeOpacity={0.7}>
                  <Text style={styles.inventoryChipText}>{item.sku || item.id}</Text>
                  <Text style={styles.inventoryChipSub}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {ingredients.length === 0 ? (
              <Text style={styles.emptyHint}>No ingredients yet. Search and tap an inventory item to add.</Text>
            ) : (
              <View style={styles.ingredientsHeader}>
                <Text style={[styles.ingHeaderText, { flex: 1.2 }]}>SKU</Text>
                <Text style={[styles.ingHeaderText, { flex: 1.8 }]}>Name</Text>
                <Text style={[styles.ingHeaderText, { width: 80, textAlign: 'center' }]}>Qty</Text>
                <Text style={[styles.ingHeaderText, { width: 80, textAlign: 'center' }]}>Unit</Text>
                <Text style={[styles.ingHeaderText, { width: 40 }]}></Text>
              </View>
            )}

            {ingredients.map((ing, index) => (
              <View key={`${ing.sku}-${index}`} style={styles.ingredientRow}>
                <TextInput
                  style={[styles.input, { flex: 1.2 }]}
                  value={String(ing.sku)}
                  onChangeText={(v) => updateIngredientAt(index, 'sku', v)}
                  placeholder="SKU"
                  placeholderTextColor="#9CA3AF"
                />
                <View style={{ width: 8 }} />
                <TextInput
                  style={[styles.input, { flex: 1.8 }]}
                  value={ing.name}
                  onChangeText={(v) => updateIngredientAt(index, 'name', v)}
                  placeholder="Name"
                  placeholderTextColor="#9CA3AF"
                />
                <View style={{ width: 8 }} />
                <TextInput
                  style={[styles.input, { width: 80, textAlign: 'center' }]}
                  value={String(ing.quantity)}
                  onChangeText={(v) => updateIngredientAt(index, 'quantity', v)}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                />
                <View style={{ width: 8 }} />
                <TextInput
                  style={[styles.input, { width: 80, textAlign: 'center' }]}
                  value={ing.unit}
                  onChangeText={(v) => updateIngredientAt(index, 'unit', v)}
                  placeholder="unit"
                  placeholderTextColor="#9CA3AF"
                />
                <View style={{ width: 8 }} />
                <TouchableOpacity style={styles.removeIngBtn} onPress={() => removeIngredientAt(index)} activeOpacity={0.7}>
                  <Ionicons name="trash" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.saveButton, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving} activeOpacity={0.8}>
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Product'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 64,
  },
  backText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#374151',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 12,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  recipeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '700',
    marginBottom: 12,
  },
  inventorySearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addFromInventoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addFromInventoryText: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  inventoryList: {
    marginBottom: 12,
  },
  inventoryChip: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
  },
  inventoryChipText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '700',
  },
  inventoryChipSub: {
    fontSize: 10,
    color: '#6B7280',
  },
  emptyHint: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  ingredientsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 8,
  },
  ingHeaderText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeIngBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ProductManagementScreen;


