import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {CartLineItem} from '../api/types';

export type CartState = {
  items: CartLineItem[];
  pendingProductIds: string[];
  lastError: string | null;
};

const initialState: CartState = {
  items: [],
  pendingProductIds: [],
  lastError: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
  setPending(state, action: PayloadAction<string>) {
      if (!state.pendingProductIds.includes(action.payload)) {
        state.pendingProductIds.push(action.payload);
      }
      state.lastError = null;
    },
    clearPending(state, action: PayloadAction<string>) {
      state.pendingProductIds = state.pendingProductIds.filter(
        id => id !== action.payload,
      );
    },
    addOrMergeItem(state, action: PayloadAction<CartLineItem>) {
      const existing = state.items.find(
        item =>
          item.productId === action.payload.productId &&
          item.variantId === action.payload.variantId,
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.lastError = null;
    },
    setError(state, action: PayloadAction<string>) {
      state.lastError = action.payload;
    },
    resetCart(state) {
      state.items = [];
      state.pendingProductIds = [];
      state.lastError = null;
    },
  },
});

export const cartActions = cartSlice.actions;
export const cartReducer = cartSlice.reducer;

export function selectCartCount(state: {cart: CartState}): number {
  return state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
}