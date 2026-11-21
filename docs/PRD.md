# Amazon-Inspired E-commerce App — PRD v1.2

**Status:** Draft / evolving  
**Reference:** 29 user-supplied Android screenshots, all showing scroll positions of the Home feed  
**Platform:** Android-first React Native, iOS-compatible architecture  
**Scope boundary:** Only Home-feed details are visually verified; other screens remain proposed pending screenshots.

## 1. Product goal
Build an original-brand, Amazon-inspired shopping app with functional discovery, product detail, search, cart, checkout, orders and accounts. Use licensed/original imagery and branding. Prioritize matching feed composition and behavior, not copying protected campaign assets.

## 2. Verified screen shell
- Android status bar above content.
- Rounded search overlay near the top with text prompt, camera and microphone; separate scanner-like icon visible on the right edge in some screenshots. Search remains fixed while content moves underneath.
- Persistent bottom bar with Home, You, Wallet, Cart, Menu, Rufus (AI). Selected Home indicator; Wallet notification dot observed.
- Long vertically scrolling feed; yellow/gold backgrounds, white product panels, red offer badges, full-bleed sponsored images.

## 3. Observed sections (combined screenshots)
1. Festival hero carousel and quick shopping/recently viewed cards.
2. Brand-sponsored product showcase (helmet cleaning) with Sponsored disclosure.
3. Festival shortcut icons and seasonal Halloween collections.
4. Handpicked deals / 4 stars and above, horizontal section group.
5. Trending deals under ₹999 with prices, MRP, offers.
6. Deals with exchange and mixed product cards.
7. Great deals on laptops and top smartphone offers.
8. More deals to consider, appliances, and Watch & Shop video with featured products.
9. Sponsored Dr. Fixit full-bleed image with disclosure.
10. Deals on Home and Furniture with price-rich 2-column cards.
11. Blockbuster Deals: asymmetrical staggered columns, discount-centric cards.
12. Small business deals: 2x2 discount-only cards.
13. Sponsored Crocs full-bleed image with disclosure.
14. Deals from Amazon Brands & more: price-rich 2-column cards.
15. Deals on daily needs: price-rich 2-column cards.
16. Deals you might like in Electronics & Photo: compact deal cards.
17. Deals you might like: compact deal cards.
18. Discover exciting offers: two-column promotional tiles.

## 4. Component catalog
- `StickySearchHeader`: text, camera, mic, scanner affordance; safe-area aware, accessible.
- `BottomTabBar`: six tabs, selection, badges, preserved navigation state.
- `HomeFeed`: virtualized vertical sections, cursor pagination, refresh, scroll restoration.
- `HeroCarousel`: campaign images, horizontal swipe, navigation, accessible controls.
- `QuickShortcutRow`: icon/image + title, horizontal scroll.
- `SectionHeader`: title and optional chevron, collection destination.
- `ProductGridSection`: 2-column white background panel; optional price/MRP.
- `PriceProductCard`: image, ellipsized title, selling price, struck-through MRP, discount and deal label.
- `CompactDealCard`: large image, discount badge and campaign label; minimal price information.
- `StaggeredDealSection`: two independently stacked columns for asymmetric card heights.
- `SponsoredHeroSection`: edge-to-edge creative and visible sponsored attribution strip.
- `CampaignTileSection`: image-based two-column offer navigation.
- `VideoShoppingSection`: poster/player, muted control, creator metadata, linked product cards, See more.

## 5. Interaction and state requirements
- All product tiles navigate to product details; section chevrons navigate to collections; sponsored creatives open configured campaigns.
- Search supports typed query and results in MVP; voice, camera, scanner and AI can initially open clearly labeled placeholder screens, then gain real functionality in later phases.
- Preserve scroll offset when opening/closing product detail; maintain bottom tabs and avoid unnecessary feed remounts.
- Provide image loading/error placeholders, network retry, empty sections, refresh, and offline fallback for cached content.
- Campaigns have validity windows and destination routing; sponsored labels must not disappear under sticky overlays.
- Feed supports deterministic seed content initially, then API-driven ordering, per-user recommendations, experiments, and analytics.
- Price, stock, coupon, shipping and discount validation occurs server-side before checkout.

## 6. Design tokens (provisional; verify via pixel measurements)
- Backgrounds: warm gold/yellow gradients and white cards.
- Discount badges: deep crimson/red with white text.
- Section headings: bold, black, roughly 20–24sp on reference device.
- Product titles: 1–2 lines, ellipsis; prices more prominent than MRP.
- Rounded white tiles: medium radii; gutters between columns.
- Responsive layout must account for screen density, font scaling and safe areas. Do not hardcode screenshot pixel dimensions.

## 7. Home-feed API model
```ts
type HomeSectionType =
  | 'hero_carousel' | 'shortcut_row' | 'product_grid'
  | 'compact_deal_grid' | 'staggered_deal_grid'
  | 'sponsored_hero' | 'campaign_tiles' | 'video_shopping';

type HomeSection = {
  id: string;
  type: HomeSectionType;
  title?: string;
  destination?: { type: 'product' | 'collection' | 'campaign'; id: string };
  layout?: { columns?: number; cardVariant?: 'price' | 'compact' | 'staggered' };
  items?: Array<{ productId?: string; campaignId?: string; videoId?: string }>;
  sponsored?: boolean;
  activeFrom?: string;
  activeUntil?: string;
};

type HomeFeedResponse = {
  version: number;
  sections: HomeSection[];
  nextCursor?: string;
};
```

Product and pricing records should be fetched/normalized separately; avoid embedding stale authoritative prices in campaign sections.

## 8. Recommended stack
React Native CLI + TypeScript; React Navigation; TanStack Query; Redux Toolkit; MMKV; FlashList; Reanimated; image caching. API: Node/NestJS, PostgreSQL/Prisma, object storage; admin Next.js. Use mock JSON fixtures before live services. Confirm version compatibility at project bootstrap.

## 9. Screen inventory
**Verified:** Home feed only (29 screenshots).  
**Proposed, pending references:** Search, search results, category listing, collection, product detail, gallery, wishlist, cart, addresses, checkout, payment, confirmation, orders, order tracking, profile, wallet, menu, AI assistant, video shopping detail, authentication, notifications.

## 10. Delivery milestones
- **M1 (1 week):** repository, navigation, tokens, fixtures, test harness.
- **M2 (2–3 weeks):** all verified Home sections, sticky search, tabs, feed virtualization, scroll preservation.
- **M3 (2 weeks):** product listing/detail, search, filters, wishlist.
- **M4 (2–3 weeks):** cart, address, mock/sandbox checkout, orders.
- **M5 (2–3 weeks):** backend, admin campaigns, catalog, inventory and analytics.
- **M6 (2–4 weeks):** video commerce, advanced discovery, accessibility, performance, release QA.

## 11. Acceptance criteria for Home MVP
1. Screen shell stays stable while scrolling a long feed.
2. All screenshot-derived section families render using seeded data.
3. Price-rich, compact, and staggered cards are visually distinct.
4. Tap targets navigate to appropriate product/collection/campaign routes.
5. Tab changes and product-detail back navigation preserve Home scroll position.
6. Skeleton, error, empty and offline states are present.
7. Sponsor attribution remains visible and associated with its campaign.
8. Performance is checked on a mid-range Android device with long feeds and image-heavy sections.
9. Voice/camera/AI affordances do not falsely imply working capabilities until integrated.
10. Visual regression tests cover representative reference layouts.

## 12. Open questions / next screenshot requests
- Product detail: hero gallery, variants, delivery, offers, Add to Cart, Buy Now.
- Search: input focus, autocomplete, filters, results, visual search.
- Cart and checkout: quantities, coupons, address, payment, confirmation.
- You/Wallet/Menu/Rufus tabs: actual navigation and features.
- Whether MVP should include real backend or mocked commerce flows first.

## 13. Change log
- **v1.0:** initial 10 Home screenshots; basic feed architecture, search, tabs, promotions, product grids, video shopping.
- **v1.1:** 10 additional Home screenshots; sponsored Dr. Fixit/Crocs creative, small-business and daily-needs sections, Electronics & Photo recommendations, mixed-height blockbuster cards, brand-specific collections, and expanded price-rich card behavior.


## 14. v1.2 — New screenshot findings (screenshots 21–29)
**Evidence scope:** nine new Android Home-feed scroll captures. No Product Detail, Cart, Search Results, or Checkout screens are yet visually verified.

### 14.1 Additional verified sections
- **Recommendations on premium collections:** two-column white panel; large footwear imagery, truncated titles and selling prices; no MRP or discount required.
- **Discover products for you:** visually distinct bright orange feed region; horizontal first-row filter chips (Categories dropdown, Value picks, Bestsellers), second-row removable campaign chip and price-range chips (Under ₹299, ₹300–…); two-column independently flowing product cards.
- **Electronics & Photo recommendations for you:** gold background, compact 2x2 discount-centric cards.
- **Deals you might like in Kitchen & Home:** compact 2x2 cards.
- **Save on Amazon Devices:** 2x2 branded device deal cards.
- **Level Up Your Hobby:** price-rich two-column panel with stationery products.
- **Deals related to your views:** browsing-history-based recommendation group.
- **Deals you might like in Toys & Games:** category recommendation section partially visible.
- **Additional sponsored creative:** finance/account promotion with explicit Sponsored disclosure.

### 14.2 Discovery card content and behavior
Discovery cards display product image, title (ellipsized), discount percentage, sale price, struck-through MRP, and optional deal label, Prime eligibility, delivery estimate (e.g. Tomorrow or 2 days), cashback and offer terms, and purchase-volume social proof (e.g. 700+ bought in past month). A circular yellow plus button overlays the image at bottom-right. The screenshots establish its presence but not the post-tap interaction; implement the proposed behavior below and verify later.

**Proposed quick-add behavior:** Tap card body to open product details. Tap plus to add a purchasable default variant; if a required variant is missing, open a variant-selection sheet. Show pending state, success feedback, updated cart count, and stock/network errors. Deduplicate in-flight requests; validate authoritative stock and price server-side. Ensure the plus has its own accessible hit target and does not trigger parent navigation.

**Proposed filter behavior:** Filter chips can be selected independently, removed, and combined; categories opens a bottom sheet; price bands are exclusive within the price dimension; other filter dimensions may be combined. Apply server-side filtering with cursor reset on change, retain selected chips and scroll position appropriately, and show loading, empty and retry states. Exact combination semantics require validation against future interaction screenshots.

### 14.3 Additional component types
- `PremiumCollectionSection` / `MinimalPriceCard` — product image, title, price, no forced offer badge.
- `DiscoveryFeedSection` — orange background, sticky-within-section or normal horizontal chip rows (behavior to verify), independent two-column masonry-style product stream, incremental loading.
- `DiscoveryFilterBar`, `FilterChip`, `ActiveFilterChip`, `CategoryFilterSheet`.
- `DiscoveryProductCard`, `QuickAddButton`, `PrimeDeliveryBadge`, `CashbackOfferBadge`, `PopularityLabel`.
- `HistoryBasedRecommendationSection` — algorithm/source metadata with consent/privacy considerations.

### 14.4 Updated feed types and data contract
```ts
type HomeSectionTypeV12 =
  | HomeSectionType
  | 'premium_collection'
  | 'discovery_feed'
  | 'personalized_product_grid'
  | 'history_related_grid';

type DiscoveryFilters = {
  categoryIds?: string[];
  valuePicks?: boolean;
  bestsellers?: boolean;
  campaignIds?: string[];
  priceBand?: { min?: number; max?: number };
};

type ProductCardPresentation = {
  productId: string;
  variant: 'minimal_price' | 'price' | 'compact' | 'discovery';
  showQuickAdd?: boolean;
  dealLabel?: string;
  primeEligible?: boolean;
  deliveryLabel?: string;
  cashbackLabel?: string;
  cashbackTerms?: string;
  popularityLabel?: string;
};

// Catalog/offer API is authoritative for price, MRP, inventory and eligibility.
// Display labels are optional presentation fields, not checkout calculations.
```

Suggested endpoints (contract subject to backend design):
- `GET /api/v1/discovery?cursor=&categoryId=&campaignId=&maxPrice=&sort=`
- `GET /api/v1/discovery/filters`
- `GET /api/v1/recommendations?context=recent_views`
- `POST /api/v1/cart/items` (idempotency key recommended)

### 14.5 Acceptance criteria additions
1. Orange discovery region is visually distinct from gold recommendation sections.
2. Two horizontal chip rows are usable on narrow Android devices and with larger font settings.
3. Applying/removing filters updates products, clears stale pagination, and handles no results.
4. Quick-add and product-card navigation have separate hit areas; variant selection is handled.
5. Cart state updates across Home and Cart tab, with retry/error behavior.
6. Discovery cards gracefully omit unavailable Prime, cashback, delivery, popularity or deal metadata.
7. Premium/minimal-price cards do not display invented discount or MRP fields.
8. Discovery stream uses virtualization and incremental loading; measure performance on mid-range Android.
9. Browsing-history recommendations support privacy-aware fallback for anonymous users.
10. Sponsored attribution remains visible on newly observed finance creative.

### 14.6 Updated priorities and milestones
- **P0:** Discovery feed shell, chip selection/removal, price filters, discovery cards, quick-add with mock cart state, and premium minimal-price card.
- **P1:** Category sheet, bestseller/value-pick filtering, Prime/delivery/cashback/popularity metadata, browsing-history recommendations, and category-specific recommendations.
- **P2:** Personalized ranking service, experiments, rich recommendation explanations.
- Extend **M2 Home implementation** by approximately 1–2 weeks for interactive discovery and quick-add, depending on design fidelity and mock/API readiness. Full backend cart validation remains in M4/M5.

### 14.7 Outstanding verification questions
- Does tapping plus add immediately, show quantity controls, or open a sheet for some items?
- Do filter chips stick within the discovery section during scrolling?
- How do Category, Value picks, Bestsellers, campaign and price filters combine?
- Does selecting a product in the discovery section preserve its filter and scroll state on return?
- What are the actual empty, loading and error states?

## 15. Change log update
- **v1.2:** nine more Home screenshots (29 total); premium collections, interactive orange discovery feed, two rows of filter chips, quick-add affordance, rich merchandising badges, history-based recommendations, device/hobby/category collections, and revised API/component requirements.
