import {cartActions, cartReducer, selectCartCount} from '../src/store/cartSlice';

describe('cartSlice', () => {
  it('merges quantities for the same variant', () => {
    let state = cartReducer(undefined, {type: '@@INIT'});
    state = cartReducer(
      state,
      cartActions.addOrMergeItem({
        productId: 'p1',
        variantId: 'v1',
        title: 'Item',
        quantity: 1,
        unitPrice: 99,
      }),
    );
    state = cartReducer(
      state,
      cartActions.addOrMergeItem({
        productId: 'p1',
        variantId: 'v1',
        title: 'Item',
        quantity: 1,
        unitPrice: 99,
      }),
    );
    expect(state.items[0].quantity).toBe(2);
    expect(selectCartCount({cart: state})).toBe(2);
  });
});