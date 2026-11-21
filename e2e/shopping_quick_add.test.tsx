import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import {addCartItem, resetCartApiState, setCartApiForceFailure} from '../src/api/cartApi';
import {cartActions} from '../src/store/cartSlice';
import {store} from '../src/store/store';
import {ShoppingTestHarness} from './testHarness';

describe('shopping quick add regression', () => {
  beforeEach(() => {
    resetCartApiState();
    store.dispatch(cartActions.resetCart());
    setCartApiForceFailure(false);
  });

  it('quick add updates cart state and cart line item', async () => {
    render(<ShoppingTestHarness />);
    await waitFor(() =>
      expect(screen.getByTestId('discovery-card-prod-discovery-001')).toBeTruthy(),
    );
    fireEvent.press(screen.getByTestId('quick-add-prod-discovery-001'));
    await waitFor(() => expect(store.getState().cart.items).toHaveLength(1));

    fireEvent.press(screen.getByTestId('tab-cart'));
    await waitFor(() =>
      expect(screen.getByTestId('cart-line-prod-discovery-001')).toBeTruthy(),
    );
    expect(screen.getByText(/Wireless Earbuds/)).toBeTruthy();
  });

  it('surfaces backend failure and leaves cart unchanged', async () => {
    render(<ShoppingTestHarness forceCartFailure />);
    await waitFor(() =>
      expect(screen.getByTestId('quick-add-prod-discovery-001')).toBeTruthy(),
    );
    fireEvent.press(screen.getByTestId('quick-add-prod-discovery-001'));
    await waitFor(() =>
      expect(screen.getByTestId('cart-status-banner')).toBeTruthy(),
    );
    expect(store.getState().cart.items).toHaveLength(0);

    fireEvent.press(screen.getByTestId('tab-cart'));
    await waitFor(() =>
      expect(screen.getByTestId('cart-error-message')).toBeTruthy(),
    );
    fireEvent.press(screen.getByTestId('cart-retry-button'));
    setCartApiForceFailure(false);
    fireEvent.press(screen.getByTestId('tab-home'));
    await waitFor(() =>
      expect(screen.getByTestId('home-screen')).toBeTruthy(),
    );
    fireEvent.press(screen.getByTestId('quick-add-prod-discovery-001'));
    await waitFor(() => expect(store.getState().cart.items).toHaveLength(1));
  });

  it('deduplicates in-flight add with the same idempotency key', async () => {
    const product = {
      productId: 'p1',
      title: 'Test',
      imageUrl: 'https://example.com/x.png',
      price: 10,
      mrp: 20,
      discountPercent: 50,
      defaultVariantId: 'v1',
    };
    const req = {
      productId: 'p1',
      variantId: 'v1',
      quantity: 1,
      idempotencyKey: 'same-key',
    };
    const [a, b] = await Promise.all([
      addCartItem(req, product),
      addCartItem(req, product),
    ]);
    expect(a.ok || b.ok).toBe(true);
    expect(a.ok && b.ok).not.toBe(true);
  });
});