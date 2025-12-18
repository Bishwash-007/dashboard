# Electronics API cURL Cookbook

Operational notes and ready-to-run cURL snippets for every route exposed by the electronics storefront backend.

## Base Setup

- Default base URL: `http://localhost:4000/api` (set by `PORT` in `.env`).
- Protected routes require `Authorization: Bearer <access_token>`; access tokens live 15 minutes, refresh tokens live 7 days.
- Send and expect JSON unless a section explicitly calls for `multipart/form-data` or raw payloads.
- Collection responses include `pagination` objects with `page`, `limit`, `total`, and `pages`.

```bash
export API_URL="http://localhost:4000/api"
export AUTH_TOKEN="<customer access token>"
export ADMIN_TOKEN="<admin access token>"

# quick health probe
curl -H "Authorization: Bearer $AUTH_TOKEN" "$API_URL/health"
```

## Health & Diagnostics

- `GET $API_URL/health` → `{ "message": "Server is running" }`
- `GET http://localhost:4000/` → `{ "message": "OK" }`

---

## Authentication & Session Flow

### 1. Sign Up

```bash
curl -X POST "$API_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alex@example.com",
    "password": "ChangeMeNow123",
    "name": "Alex Doe"
  }'
```

```json
{
  "message": "User registered successfully. Please verify your email.",
  "user": {
    "_id": "66595d1a9b0f5b0012a45678",
    "email": "alex@example.com",
    "role": "user",
    "isEmailVerified": false
  },
  "tokens": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

An OTP is emailed immediately; verifying it flips `isEmailVerified`.

### 2. Login

```bash
curl -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alex@example.com",
    "password": "ChangeMeNow123"
  }'
```

Returns the same envelope as signup with rotated tokens.

### 3. Request OTP

```bash
curl -X POST "$API_URL/auth/otp/request" \
  -H "Content-Type: application/json" \
  -d '{ "email": "alex@example.com" }'
```

Response: `{ "message": "OTP sent to your email" }`.

### 4. Verify OTP

```bash
curl -X POST "$API_URL/auth/otp/verify" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alex@example.com",
    "code": "123456"
  }'
```

Optional `userId` lets you verify accounts that were pre-seeded by the admin setup script. Success payload: `{ "message": "Email verified successfully", "user": { ... } }`.

### 5. Refresh Access Token

```bash
curl -X POST "$API_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{ "refreshToken": "<stored refresh token>" }'
```

```json
{
  "message": "Token refreshed",
  "tokens": {
    "accessToken": "new-access-token",
    "refreshToken": "rotated-refresh-token"
  }
}
```

### 6. Logout

```bash
curl -X POST "$API_URL/auth/logout" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

Revokes every refresh token stored for the caller.

---

## Product Catalog

### 1. List or Search Products

```bash
curl "$API_URL/products?page=1&limit=12&categories=66595d1a9b0f5b0012a40001,66595d1a9b0f5b0012a40002&minPrice=100&maxPrice=1500&minRating=4&search=galaxy"
```

**Query helpers**

- `categories` &mdash; comma-separated category IDs.
- `minPrice` / `maxPrice` &mdash; variant price filter (USD).
- `minRating` &mdash; minimum average rating.
- `search` &mdash; full-text search; `/products/search` is an alias.
- Pagination defaults: `page=1`, `limit=10` (max 100).

```json
{
  "message": "Products retrieved successfully",
  "data": [
    {
      "_id": "66595d1a9b0f5b0012a40010",
      "name": "Samsung Galaxy S24",
      "brand": "Samsung",
      "variants": [
        { "_id": "66595d1a9b0f5b0012a40011", "color": "Black", "price": 999.99, "stock": 12 }
      ],
      "rating": 4.5,
      "reviewCount": 120
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "pages": 4
  }
}
```

### 2. Product Detail

```bash
curl "$API_URL/products/66595d1a9b0f5b0012a40010"
```

### 3. Products by Category

```bash
curl "$API_URL/products/category/smartphones?minPrice=500&maxPrice=2000"
```

### 4. Upload Product Images (Admin)

```bash
curl -X POST "$API_URL/products/upload" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "images=@/path/to/front.jpg" \
  -F "images=@/path/to/back.jpg"
```

Returns `{ "message": "Images uploaded successfully", "data": { "count": 2, "images": [ ... ], "assets": [ ... ] } }`. Field name is `images`, up to 5 files per request, max 5 MB each (JPG, JPEG, PNG, GIF, WebP).

### 5. Create Product (Admin)

```bash
curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "description": "Apple flagship smartphone",
    "brand": "Apple",
    "categories": ["66595d1a9b0f5b0012a40001"],
    "variants": [
      { "color": "Blue Titanium", "price": 1199, "stock": 50, "sku": "IP15P-BLU-256" }
    ],
    "images": ["https://res.cloudinary.com/demo/image/upload/v123/front.jpg"],
    "specifications": { "chip": "A17 Pro", "storage": "256 GB" }
  }'
```

### 6. Update Product (Admin)

```bash
curl -X PATCH "$API_URL/products/66595d1a9b0f5b0012a40010" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "description": "Now with titanium frame" }'
```

### 7. Delete Product (Admin)

```bash
curl -X DELETE "$API_URL/products/66595d1a9b0f5b0012a40010" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Response: `{ "message": "Product deleted successfully" }`.

---

## Cart (Authenticated)

### 1. Get Cart

```bash
curl "$API_URL/cart" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

```json
{
  "message": "Cart retrieved successfully",
  "items": [
    {
      "_id": "66595d1a9b0f5b0012a50020",
      "product": "66595d1a9b0f5b0012a40010",
      "variantId": "66595d1a9b0f5b0012a40011",
      "quantity": 2
    }
  ],
  "total": {
    "subtotal": 1999.98,
    "total": 1999.98,
    "lineItems": 1,
    "itemCount": 2
  }
}
```

### 2. Get Cart Total

```bash
curl "$API_URL/cart/total" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### 3. Add Item

```bash
curl -X POST "$API_URL/cart/add" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "66595d1a9b0f5b0012a40010",
    "variantId": "66595d1a9b0f5b0012a40011",
    "quantity": 2
  }'
```

### 4. Update Quantity

```bash
curl -X PATCH "$API_URL/cart/items/66595d1a9b0f5b0012a50020" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "quantity": 3 }'
```

### 5. Remove Item

```bash
# remove a specific variant
curl -X DELETE "$API_URL/cart/items/66595d1a9b0f5b0012a40010/66595d1a9b0f5b0012a40011" \
  -H "Authorization: Bearer $AUTH_TOKEN"

# remove every variant of a product
curl -X DELETE "$API_URL/cart/items/66595d1a9b0f5b0012a40010" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

---

## Address Book (Authenticated)

### 1. List Addresses

```bash
curl "$API_URL/addresses" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### 2. Create Address

```bash
curl -X POST "$API_URL/addresses" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Alex Doe",
    "phone": "+1-555-0199",
    "street": "123 Market Street",
    "city": "San Francisco",
    "state": "CA",
    "country": "USA",
    "postalCode": "94105",
    "isDefault": true
  }'
```

### 3. Update Address

```bash
curl -X PATCH "$API_URL/addresses/66595d1a9b0f5b0012a46000" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "city": "Los Angeles", "isDefault": false }'
```

### 4. Delete Address

```bash
curl -X DELETE "$API_URL/addresses/66595d1a9b0f5b0012a46000" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

---

## Orders (Authenticated)

### 1. Create Order

If `items` is omitted, the server copies items from the caller's cart.

```bash
curl -X POST "$API_URL/orders" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "addressId": "66595d1a9b0f5b0012a46000",
    "items": [
      {
        "productId": "66595d1a9b0f5b0012a40010",
        "variantId": "66595d1a9b0f5b0012a40011",
        "quantity": 1
      }
    ]
  }'
```

Response: `{ "message": "Order created successfully", "data": { "orderNumber": "ORD-2024-001", "items": [...], "totalAmount": 1299 } }`.

### 2. List Orders

```bash
curl "$API_URL/orders?page=1&limit=10" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### 3. Get Order Detail

```bash
curl "$API_URL/orders/66595d1a9b0f5b0012a47000" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### 4. Cancel Order

```bash
curl -X PATCH "$API_URL/orders/66595d1a9b0f5b0012a47000/cancel" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "reason": "Need to change address" }'
```

Response: `{ "message": "Order cancelled successfully", "data": { ... } }`.

---

## Payments

### 1. Create Stripe Payment Intent

```bash
curl -X POST "$API_URL/payments/create-intent" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "orderId": "66595d1a9b0f5b0012a47000" }'
```

```json
{
  "message": "Payment intent created",
  "data": {
    "clientSecret": "pi_3Ov..._secret_Fx",
    "paymentIntentId": "pi_3Ov...",
    "amount": 1299
  }
}
```

### 2. Refund Payment

```bash
curl -X POST "$API_URL/payments/refund/66595d1a9b0f5b0012a47000" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "amount": 100.00 }'
```

Omit `amount` to refund the captured total.

### 3. Stripe Webhook

```bash
curl -X POST "$API_URL/payments/webhook" \
  -H "Stripe-Signature: t=1700000000,v1=abcd,v0=efgh" \
  -H "Content-Type: application/json" \
  --data-binary @stripe-event.json
```

Send raw bodies so the `stripe-signature` header can be verified (`express.raw` body parser). Supported events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`. Response: `{ "received": true }`.

---

## Reviews (Mounted under `/api/products`)

### 1. List Reviews

```bash
curl "$API_URL/products/66595d1a9b0f5b0012a40010/reviews?page=1&limit=5"
```

### 2. Review Stats

```bash
curl "$API_URL/products/66595d1a9b0f5b0012a40010/reviews/stats"
```

```json
{
  "message": "Review statistics retrieved",
  "data": {
    "averageRating": 4.5,
    "totalReviews": 12,
    "distribution": { "1": 0, "2": 1, "3": 2, "4": 4, "5": 5 }
  }
}
```

### 3. Create Review

```bash
curl -X POST "$API_URL/products/66595d1a9b0f5b0012a40010/review" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "rating": 5, "comment": "Excellent screen and battery life." }'
```

### 4. Delete Review

```bash
curl -X DELETE "$API_URL/products/reviews/66595d1a9b0f5b0012a4f000" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### 5. Mark Helpful

```bash
curl -X POST "$API_URL/products/reviews/66595d1a9b0f5b0012a4f000/helpful" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

---

## Admin APIs (Role: `admin`)

### 1. Dashboard Snapshot

```bash
curl "$API_URL/admin/dashboard" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Response contains totals (`totalOrders`, `totalRevenue`, `totalProducts`, `totalUsers`), `recentOrders`, and `ordersByStatus`.

### 2. List Orders

```bash
curl "$API_URL/admin/orders?status=processing&page=1&limit=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 3. Update Order Status

```bash
curl -X PATCH "$API_URL/admin/orders/66595d1a9b0f5b0012a47000/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "status": "shipped", "notes": "Tracking sent via email" }'
```

Allowed statuses: `pending`, `processing`, `shipped`, `delivered`, `cancelled`. Every update is logged to `AuditLog`.

### 4. List Users

```bash
curl "$API_URL/admin/users?role=user&page=1&limit=25" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 5. Sales Report

```bash
curl "$API_URL/admin/reports/sales?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Returns `salesData` aggregated by day and `topProducts` ranked by revenue.

### 6. Audit Logs

```bash
curl "$API_URL/admin/audit-logs?page=1&limit=50" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Pagination & Filtering Cheatsheet

- `page` (default 1) and `limit` (default 10, max 100) exist on every collection route.
- Unknown filters are ignored; validation errors surface when required inputs are missing.
- Products currently return newest entries first; apply client-side sorting if you need a different order.
- Use `skip = (page - 1) * limit` logic when you need to line up subsequent requests.

```bash
curl "$API_URL/products?minPrice=200&maxPrice=1000&minRating=4&page=2&limit=8"
```

---

## Error Format & Rate Limiting

| Status | Meaning |
| --- | --- |
| 400 | Validation failure (fields array included) |
| 401 | Missing/invalid access token |
| 403 | Role mismatch or revoked refresh token |
| 404 | Missing record or route |
| 409 | Duplicate resource |
| 429 | Rate limit exceeded (100 requests / 15 minutes / IP) |
| 500 | Unexpected server error |

```json
{
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

Rate-limited responses include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers. Health checks (`/api/health`, `/`) are exempt from throttling.

---

**Last Updated:** February 2025  
**API Version:** 1.0.0
###############

## Product Endpoints

### 7. Get All Products
**GET** `/products`

```bash
curl -X GET "http://localhost:4000/api/products?page=1&limit=10&categories=507f1f77bcf86cd799439011"
```

**Response (200):**
```json
{
  "message": "Products retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Samsung Galaxy S24",
      "description": "Latest flagship smartphone",
      "brand": "Samsung",
      "categories": ["507f1f77bcf86cd799439011"],
      "variants": [
        {
          "_id": "507f1f77bcf86cd799439013",
          "color": "Black",
          "price": 999.99,
          "stock": 50,
          "sku": "SGS24-BLK"
        }
      ],
      "rating": 4.5,
      "reviewCount": 120
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

---

### 8. Get Product by ID
**GET** `/products/:id`

```bash
curl -X GET http://localhost:4000/api/products/507f1f77bcf86cd799439012
```

**Response (200):**
```json
{
  "message": "Product retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Samsung Galaxy S24",
    "brand": "Samsung",
    "categories": ["507f1f77bcf86cd799439011"],
    "variants": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "color": "Black",
        "price": 999.99,
        "stock": 50,
        "sku": "SGS24-BLK"
      }
    ],
    "rating": 4.5,
    "reviewCount": 120
  }
}
```

---

### 9. Get Products by Category
**GET** `/products/category/:slug`

```bash
curl -X GET http://localhost:4000/api/products/category/smartphones
```

Response shape matches endpoint 7.

---

### 10. Create Product (Admin)
**POST** `/products`

```bash
curl -X POST http://localhost:4000/api/products \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "description": "Apple flagship smartphone",
    "brand": "Apple",
    "categories": ["507f1f77bcf86cd799439011"],
    "variants": [
      {
        "color": "Deep Purple",
        "price": 1099.99,
        "stock": 100,
        "sku": "IP15P-PURPLE"
      }
    ]
  }'
```

**Response (201):** message `Product created successfully` with `data` = new product.

---

### 11. Update Product (Admin)
**PATCH** `/products/:id`

```bash
curl -X PATCH http://localhost:4000/api/products/507f1f77bcf86cd799439015 \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated copy"
  }'
```

**Response (200):** message `Product updated successfully` and `data` with updated fields.

---

### 12. Delete Product (Admin)
**DELETE** `/products/:id`

```bash
curl -X DELETE http://localhost:4000/api/products/507f1f77bcf86cd799439015 \
  -H "Authorization: Bearer <admin_token>"
```

**Response (200):** `{ "message": "Product deleted successfully" }`

---

## Cart Endpoints (auth required)

### 13. Get Cart
**GET** `/cart`

```bash
curl -X GET http://localhost:4000/api/cart \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
{
  "message": "Cart retrieved successfully",
  "items": [
    {
      "_id": "6601e3c2a12b34f5d6789123",
      "product": "507f1f77bcf86cd799439012",
      "variantId": "507f1f77bcf86cd799439013",
      "quantity": 2
    }
  ],
  "total": {
    "subtotal": 1999.98,
    "total": 1999.98,
    "lineItems": 1,
    "itemCount": 2
  }
}
```

### 14. Add Item
**POST** `/cart/add`

```bash
curl -X POST http://localhost:4000/api/cart/add \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "507f1f77bcf86cd799439012",
    "variantId": "507f1f77bcf86cd799439013",
    "quantity": 1
  }'
```

**Response (200):** message `Item added to cart` and `data` containing the entire cart document (items array, timestamps, etc.).

### 15. Update Quantity
**PATCH** `/cart/items/:itemId`

```bash
curl -X PATCH http://localhost:4000/api/cart/items/6601e3c2a12b34f5d6789123 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 3
  }'
```

**Response (200):** `{ "message": "Cart item updated", "data": { ...cart } }`

### 16. Remove Item
**DELETE** `/cart/items/:productId` *(append `/variantId` for variant-specific removal)*

```bash
curl -X DELETE http://localhost:4000/api/cart/items/507f1f77bcf86cd799439012/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer <token>"
```

**Response (200):** `{ "message": "Item removed from cart", "data": { ...cart } }`

### 17. Cart Total
**GET** `/cart/total`

```bash
curl -X GET http://localhost:4000/api/cart/total \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
{
  "message": "Cart total calculated",
  "total": {
    "subtotal": 1999.98,
    "total": 1999.98,
    "lineItems": 1,
    "itemCount": 2
  }
}
```

---

## Address Endpoints (auth required)

### 18. List Addresses
**GET** `/addresses`

```bash
curl -X GET http://localhost:4000/api/addresses \
  -H "Authorization: Bearer <token>"
```

**Response (200):** `{ "message": "Addresses retrieved", "data": [ ... ] }`

### 19. Create Address
**POST** `/addresses`

```bash
curl -X POST http://localhost:4000/api/addresses \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "phone": "+1-555-0123",
    "street": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "postalCode": "10001",
    "isDefault": true
  }'
```

**Response (201):** `{ "message": "Address created", "data": { ... } }`

### 20. Update Address
**PATCH** `/addresses/:id`

```bash
curl -X PATCH http://localhost:4000/api/addresses/6601e3c2a12b34f5d6789000 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "city": "Los Angeles" }'
```

**Response (200):** `{ "message": "Address updated", "data": { ... } }`

### 21. Delete Address
**DELETE** `/addresses/:id`

```bash
curl -X DELETE http://localhost:4000/api/addresses/6601e3c2a12b34f5d6789000 \
  -H "Authorization: Bearer <token>"
```

**Response (200):** `{ "message": "Address deleted" }`

---

## Order Endpoints (auth required)

### 22. Create Order
**POST** `/orders`

```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "addressId": "507f1f77bcf86cd799439021",
    "items": [
      {
        "productId": "507f1f77bcf86cd799439012",
        "variantId": "507f1f77bcf86cd799439013",
        "quantity": 2
      }
    ]
  }'
```

**Response (201):** message `Order created successfully` with `data` containing order snapshot.

### 23. List Orders
**GET** `/orders`

```bash
curl -X GET "http://localhost:4000/api/orders?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

**Response (200):** `{ "message": "Orders retrieved successfully", "data": [...], "pagination": {...} }`

### 24. Get Order
**GET** `/orders/:id`

```bash
curl -X GET http://localhost:4000/api/orders/507f1f77bcf86cd799439022 \
  -H "Authorization: Bearer <token>"
```

**Response (200):** `{ "message": "Order retrieved successfully", "data": { ... } }`

### 25. Cancel Order
**PATCH** `/orders/:id/cancel`

```bash
curl -X PATCH http://localhost:4000/api/orders/507f1f77bcf86cd799439022/cancel \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "reason": "Changed my mind" }'
```

**Response (200):** `{ "message": "Order cancelled successfully", "data": { ... } }`

---

## Payment Endpoints

### 26. Create Payment Intent
**POST** `/payments/create-intent` *(auth required)*

```bash
curl -X POST http://localhost:4000/api/payments/create-intent \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "orderId": "507f1f77bcf86cd799439022" }'
```

**Response (200):** `{ "message": "Payment intent created", "data": { "clientSecret": "...", "publishableKey": "...", "orderId": "..." } }`

### 27. Refund Payment
**POST** `/payments/refund/:orderId` *(auth required)*

```bash
curl -X POST http://localhost:4000/api/payments/refund/507f1f77bcf86cd799439022 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "amount": 100.00 }'
```

**Response (200):** `{ "message": "Refund processed", "data": { ... } }`

### 28. Stripe Webhook
**POST** `/payments/webhook`

Send Stripe events with the raw body and signature header. Response is `{ "received": true }`.

---

## Review Endpoints

> Mounted under `/api/products`, so prepend `/api/products` to every path.

### 29. Get Product Reviews
**GET** `/api/products/:productId/reviews`

```bash
curl -X GET http://localhost:4000/api/products/507f1f77bcf86cd799439012/reviews
```

**Response (200):** `{ "message": "Reviews retrieved successfully", "data": [...], "pagination": {...} }`

### 30. Review Stats
**GET** `/api/products/:productId/reviews/stats`

```bash
curl -X GET http://localhost:4000/api/products/507f1f77bcf86cd799439012/reviews/stats
```

**Response (200):** `{ "message": "Review statistics retrieved", "data": { "averageRating": "4.5", "totalReviews": 12, "distribution": {"1":0,...} } }`

### 31. Create Review
**POST** `/api/products/:productId/review` *(auth required)*

```bash
curl -X POST http://localhost:4000/api/products/507f1f77bcf86cd799439012/review \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "rating": 5, "comment": "Excellent product" }'
```

**Response (201):** `{ "message": "Review created successfully", "data": { ... } }`

### 32. Delete Review
**DELETE** `/api/products/reviews/:reviewId` *(auth required)*

**Response (200):** `{ "message": "Review deleted successfully" }`

### 33. Mark Helpful
**POST** `/api/products/reviews/:reviewId/helpful` *(auth required)*

**Response (200):** `{ "message": "Review marked helpful", "data": { ...updated review... } }`

---

## Admin Endpoints (auth + `admin` role)

### 34. Dashboard
**GET** `/admin/dashboard`

```bash
curl -X GET http://localhost:4000/api/admin/dashboard \
  -H "Authorization: Bearer <admin_token>"
```

**Response (200):**
```json
{
  "message": "Dashboard data retrieved",
  "data": {
    "totalOrders": 320,
    "totalRevenue": 125000,
    "totalProducts": 85,
    "totalUsers": 150,
    "recentOrders": [ ... ],
    "ordersByStatus": [ ... ]
  }
}
```

### 35. List Orders
**GET** `/admin/orders`

Returns `{ "message": "Orders retrieved successfully", "data": [...], "pagination": {...} }` with optional `status`, `page`, `limit` filters.

### 36. Update Order Status
**PATCH** `/admin/orders/:orderId/status`

```bash
curl -X PATCH http://localhost:4000/api/admin/orders/507f1f77bcf86cd799439022/status \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{ "status": "shipped", "notes": "Tracking sent" }'
```

**Response (200):**
```json
{
  "message": "Order status updated",
  "data": {
    "_id": "507f1f77bcf86cd799439022",
    "orderNumber": "ORD-2024-001",
    "status": "shipped",
    "notes": "Tracking sent",
    "paymentStatus": "completed",
    "items": [
      {
        "productName": "Samsung Galaxy S24",
        "quantity": 1,
        "price": 999.99
      }
    ],
    "updatedAt": "2025-12-18T19:00:00Z"
  }
}
```

Allowed statuses: `pending`, `processing`, `shipped`, `delivered`, `cancelled`. Every update is recorded in the audit log with the admin’s ID and the previous/new status values.

### 37. List Users
**GET** `/admin/users`

Response: `{ "message": "Users retrieved successfully", "data": [...], "pagination": {...} }` with optional `role` filter.

### 38. Sales Report
**GET** `/admin/reports/sales`

Supports `startDate` and `endDate` query params. Response: `{ "message": "Sales report retrieved", "data": { "salesData": [...], "topProducts": [...] } }`

### 39. Audit Logs
**GET** `/admin/audit-logs`

Response: `{ "message": "Audit logs retrieved", "data": [...], "pagination": {...} }`

---

## Health Checks

- `GET /api/health` → `{ "message": "Server is running" }`
- `GET /` → `{ "message": "OK" }`

---

## Common Error Codes

- **400 Bad Request** → validation failures (fields + messages)
- **401 Unauthorized** → authentication required/invalid token
- **403 Forbidden** → insufficient role/permissions
- **404 Not Found** → missing resource or route
- **409 Conflict** → duplicates
- **500 Internal Server Error** → unhandled errors

Example validation error:
```json
{
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

---

## Rate Limiting
- 100 requests / 15-minute window per IP (`RATE_LIMIT_WINDOW_MS` & `RATE_LIMIT_MAX_REQUESTS`)
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Auth Notes
1. Access tokens expire after 15 minutes (`JWT_ACCESS_EXPIRY`).
2. Refresh tokens expire after 7 days (`JWT_REFRESH_EXPIRY`).
3. Refresh tokens are hashed and rotated on every login/refresh.
4. Store tokens securely (HttpOnly cookies or secure storage on trusted clients).

---

## File Uploads

Admins can upload product media to Cloudinary and reuse the returned URLs when creating or updating products.

**POST** `/products/upload` (requires `admin` token, `multipart/form-data`)

```bash
curl -X POST http://localhost:4000/api/products/upload \
  -H "Authorization: Bearer <admin_token>" \
  -F "images=@/path/to/front.jpg" \
  -F "images=@/path/to/back.jpg"
```

**Response (201):**
```json
{
  "message": "Images uploaded successfully",
  "data": {
    "count": 2,
    "images": [
      "https://res.cloudinary.com/demo/image/upload/v123/front.jpg",
      "https://res.cloudinary.com/demo/image/upload/v123/back.jpg"
    ],
    "assets": [
      {
        "url": "https://res.cloudinary.com/demo/image/upload/v123/front.jpg",
        "filename": "electronics-ecommerce/front",
        "mimetype": "image/jpeg",
        "size": 234567
      }
    ]
  }
}
```

- Field name: `images` (up to 5 files per request)
- Max size: 5 MB per image
- Allowed formats: JPG, JPEG, PNG, GIF, WebP


---

## Pagination & Filtering

All collection endpoints accept `page` and `limit` (default 1 and 10, max 100). Responses include:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

Filtering examples:

```bash
# Price band + newest first
curl "http://localhost:4000/api/products?minPrice=100&maxPrice=1000&sort=-createdAt"

# Admin orders filtered by status
curl "http://localhost:4000/api/admin/orders?status=shipped&page=2"
```

---

## Webhook Events

- `charge.succeeded`
- `charge.failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Send all Stripe events to `POST /api/payments/webhook` with the raw request body and signature header.

---

**Last Updated:** December 2025  
**API Version:** 1.0.0
