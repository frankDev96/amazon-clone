export type Product = {
  productId: string;
  title: string;
  imageUrl: string;
  price: number;
  mrp: number;
  discountPercent: number;
  dealLabel?: string;
  primeEligible?: boolean;
  deliveryLabel?: string;
  cashbackLabel?: string;
  popularityLabel?: string;
  defaultVariantId: string;
};

export type CartLineItem = {
  productId: string;
  variantId: string;
  title: string;
  quantity: number;
  unitPrice: number;
};

export type AddCartItemRequest = {
  productId: string;
  variantId: string;
  quantity: number;
  idempotencyKey: string;
};

export type AddCartItemResult =
  | { ok: true; item: CartLineItem }
  | { ok: false; code: 'network' | 'out_of_stock'; message: string };