import { createSlice } from '@reduxjs/toolkit';
import { sampleProducts } from '../../data/sampleData';

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: sampleProducts,
    searchQuery: '',
    selectedCategory: 'All',
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    addProduct: (state, action) => {
      state.items.push(action.payload);
    },
    updateProduct: (state, action) => {
      const index = state.items.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) state.items[index] = action.payload;
    },
    deleteProduct: (state, action) => {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },
    updateStock: (state, action) => {
      const { id, quantity } = action.payload;
      const product = state.items.find((p) => p.id === id);
      if (product) product.stock -= quantity;
    },
  },
});

export const {
  setSearchQuery,
  setSelectedCategory,
  addProduct,
  updateProduct,
  deleteProduct,
  updateStock,
} = productsSlice.actions;

export const selectFilteredProducts = (state) => {
  const { items, searchQuery, selectedCategory } = state.products;
  return items.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
};

export default productsSlice.reducer;
