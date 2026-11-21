import {useCallback} from 'react';
import {addCartItem} from '../api/cartApi';
import type {Product} from '../api/types';
import {cartActions} from '../store/cartSlice';
import {useAppDispatch} from './useAppDispatch';

export function useQuickAdd() {
  const dispatch = useAppDispatch();

  const quickAdd = useCallback(
    async (product: Product, idempotencyKey: string) => {
      dispatch(cartActions.setPending(product.productId));
      const result = await addCartItem(
        {
          productId: product.productId,
          variantId: product.defaultVariantId,
          quantity: 1,
          idempotencyKey,
        },
        product,
      );
      dispatch(cartActions.clearPending(product.productId));
      if (result.ok) {
        dispatch(cartActions.addOrMergeItem(result.item));
        return {ok: true as const};
      }
      dispatch(cartActions.setError(result.message));
      return {ok: false as const, message: result.message};
    },
    [dispatch],
  );

  return {quickAdd};
}