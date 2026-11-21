import type { AddCartItemRequest, AddCartItemResult, Product } from './types';

let forceFailure = false;
const inFlight = new Set<string>();

export function setCartApiForceFailure(enabled: boolean): void {
  forceFailure = enabled;
}

export function resetCartApiState(): void {
  forceFailure = false;
  inFlight.clear();
}

export async function addCartItem(
  request: AddCartItemRequest,
  product: Product,
): Promise<AddCartItemResult> {
  if (inFlight.has(request.idempotencyKey)) {
    return {
      ok: false,
      code: 'network',
      message: 'Request already in progress',
    };
  }
  inFlight.add(request.idempotencyKey);
  try {
    await delay(80);
    if (forceFailure) {
      return { ok: false, code: 'network', message: 'Service unavailable (503)' };
    }
    if (!product.defaultVariantId) {
      return { ok: false, code: 'out_of_stock', message: 'Variant required' };
    }
    return {
      ok: true,
      item: {
        productId: product.productId,
        variantId: request.variantId,
        title: product.title,
        quantity: request.quantity,
        unitPrice: product.price,
      },
    };
  } finally {
    inFlight.delete(request.idempotencyKey);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}