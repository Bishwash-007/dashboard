# Electronics E-Commerce API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### 1. User Signup

**POST** `/auth/signup`

**Request:**

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "John Doe"
  }'
```

**Response (201 Created):**

```json
{
  "message": "User registered successfully. Please verify your email.",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "message": "Email already exists"
}
```

---

### 2. User Login

**POST** `/auth/login`

**Request:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

**Response (200 OK):**

```json
{
  "message": "Login successful",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401 Unauthorized):**

```json
{
  "message": "Invalid credentials"
}
```

---

### 3. Refresh Token

**POST** `/auth/refresh`

**Request:**

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Response (200 OK):**

```json
{
  "message": "Token refreshed",
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 4. Logout

**POST** `/auth/logout`

**Request:**

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Response (200 OK):**

```json
{
  "message": "Logged out successfully"
}
```

---

### 5. Send OTP

**POST** `/auth/send-otp`

**Request:**

```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

**Response (200 OK):**

```json
{
  "message": "OTP sent to your email"
}
```

---

### 6. Verify OTP

**POST** `/auth/verify-otp`

**Request:**

```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "123456"
  }'
```

**Response (200 OK):**

```json
{
  "message": "OTP verified successfully",
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Product Endpoints

### 7. Get All Products

**GET** `/products`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `categories` (optional): Filter by category IDs
- `search` (optional): Search by product name/description
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `brand` (optional): Filter by brand

**Request:**

```bash
curl -X GET "http://localhost:3000/api/products?page=1&limit=10&categories=507f1f77bcf86cd799439011" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**

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
      "averageRating": 4.5,
      "totalReviews": 120,
      "image": "https://cloudinary-url.com/image.jpg"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 45,
    "itemsPerPage": 10
  }
}
```

---

### 8. Get Product by ID

**GET** `/products/:id`

**Request:**

```bash
curl -X GET http://localhost:3000/api/products/507f1f77bcf86cd799439012 \
  -H "Content-Type: application/json"
```

**Response (200 OK):**

```json
{
  "message": "Product retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Samsung Galaxy S24",
    "description": "Latest flagship smartphone with advanced features",
    "brand": "Samsung",
    "categories": ["507f1f77bcf86cd799439011"],
    "variants": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "color": "Black",
        "price": 999.99,
        "stock": 50,
        "sku": "SGS24-BLK"
      },
      {
        "_id": "507f1f77bcf86cd799439014",
        "color": "White",
        "price": 999.99,
        "stock": 35,
        "sku": "SGS24-WHT"
      }
    ],
    "averageRating": 4.5,
    "totalReviews": 120,
    "image": "https://cloudinary-url.com/image.jpg",
    "createdAt": "2024-01-10T08:00:00Z"
  }
}
```

---

### 9. Create Product (Admin Only)

**POST** `/products`

**Request:**

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
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

**Response (201 Created):**

```json
{
  "message": "Product created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "name": "iPhone 15 Pro",
    "description": "Apple flagship smartphone",
    "brand": "Apple",
    "categories": ["507f1f77bcf86cd799439011"],
    "variants": [
      {
        "_id": "507f1f77bcf86cd799439016",
        "color": "Deep Purple",
        "price": 1099.99,
        "stock": 100,
        "sku": "IP15P-PURPLE"
      }
    ]
  }
}
```

---

### 10. Update Product (Admin Only)

**PUT** `/products/:id`

**Request:**

```bash
curl -X PUT http://localhost:3000/api/products/507f1f77bcf86cd799439015 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro Max",
    "description": "Updated description"
  }'
```

**Response (200 OK):**

```json
{
  "message": "Product updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "name": "iPhone 15 Pro Max",
    "description": "Updated description"
  }
}
```

---

### 11. Delete Product (Admin Only)

**DELETE** `/products/:id`

**Request:**

```bash
curl -X DELETE http://localhost:3000/api/products/507f1f77bcf86cd799439015 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**

```json
{
  "message": "Product deleted successfully"
}
```

---

## Category Endpoints

### 12. Get All Categories

**GET** `/categories`

**Request:**

```bash
curl -X GET http://localhost:3000/api/categories \
  -H "Content-Type: application/json"
```

**Response (200 OK):**

```json
{
  "message": "Categories retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Smartphones",
      "slug": "smartphones",
      "description": "Mobile phones and accessories",
      "productCount": 45
    },
    {
      "_id": "507f1f77bcf86cd799439017",
      "name": "Laptops",
      "slug": "laptops",
      "description": "Computers and laptops",
      "productCount": 28
    }
  ]
}
```

---

### 13. Create Category (Admin Only)

**POST** `/categories`

**Request:**

```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tablets",
    "slug": "tablets",
    "description": "Tablets and iPad devices"
  }'
```

**Response (201 Created):**

```json
{
  "message": "Category created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439018",
    "name": "Tablets",
    "slug": "tablets",
    "description": "Tablets and iPad devices"
  }
}
```

---

## Cart Endpoints

### 14. Get Cart

**GET** `/cart`

**Request:**

```bash
curl -X GET http://localhost:3000/api/cart \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Response (200 OK):**

```json
{
  "message": "Cart retrieved successfully",
  "items": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "productId": "507f1f77bcf86cd799439012",
      "variantId": "507f1f77bcf86cd799439013",
      "quantity": 2,
      "price": 999.99,
      "productName": "Samsung Galaxy S24",
      "color": "Black"
    }
  ],
  "subtotal": 1999.98,
  "total": 2169.97
}
```

---

### 15. Add Item to Cart

**POST** `/cart/add`

**Request:**

```bash
curl -X POST http://localhost:3000/api/cart/add \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "507f1f77bcf86cd799439012",
    "variantId": "507f1f77bcf86cd799439013",
    "quantity": 1
  }'
```

**Response (200 OK):**

```json
{
  "message": "Item added to cart",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "productId": "507f1f77bcf86cd799439012",
    "variantId": "507f1f77bcf86cd799439013",
    "quantity": 1,
    "price": 999.99
  }
}
```

**Error Response (400 Bad Request - Insufficient Stock):**

```json
{
  "message": "Insufficient stock"
}
```

---

### 16. Update Cart Item Quantity

**PUT** `/cart/update/:itemId`

**Request:**

```bash
curl -X PUT http://localhost:3000/api/cart/update/507f1f77bcf86cd799439020 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 3
  }'
```

**Response (200 OK):**

```json
{
  "message": "Cart updated successfully",
  "data": {
    "items": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "quantity": 3
      }
    ]
  }
}
```

---

### 17. Remove Item from Cart

**DELETE** `/cart/remove/:itemId`

**Request:**

```bash
curl -X DELETE http://localhost:3000/api/cart/remove/507f1f77bcf86cd799439020 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**

```json
{
  "message": "Item removed from cart"
}
```

---

### 18. Clear Cart

**DELETE** `/cart/clear`

**Request:**

```bash
curl -X DELETE http://localhost:3000/api/cart/clear \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**

```json
{
  "message": "Cart cleared successfully"
}
```

---

### 19. Get Cart Total

**GET** `/cart/total`

**Request:**

```bash
curl -X GET http://localhost:3000/api/cart/total \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**

```json
{
  "message": "Cart total calculated",
  "total": 3269.96
}
```

---

## Address Endpoints

### 20. Create Address

**POST** `/addresses`

**Request:**

```bash
curl -X POST http://localhost:3000/api/addresses \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
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

**Response (201 Created):**

```json
{
  "message": "Address created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439021",
    "userId": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "phone": "+1-555-0123",
    "street": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "postalCode": "10001",
    "isDefault": true
  }
}
```

---

### 21. Get All Addresses

**GET** `/addresses`

**Request:**

```bash
curl -X GET http://localhost:3000/api/addresses \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**

```json
{
  "message": "Addresses retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439021",
      "fullName": "John Doe",
      "phone": "+1-555-0123",
      "street": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "postalCode": "10001",
      "isDefault": true
    }
  ]
}
```

---

### 22. Get Address by ID

**GET** `/addresses/:id`

**Request:**

```bash
curl -X GET http://localhost:3000/api/addresses/507f1f77bcf86cd799439021 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**

```json
{
  "message": "Address retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439021",
    "fullName": "John Doe",
    "phone": "+1-555-0123",
    "street": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "postalCode": "10001",
    "isDefault": true
  }
}
```

---

### 23. Update Address

**PUT** `/addresses/:id`

**Request:**

```bash
curl -X PUT http://localhost:3000/api/addresses/507f1f77bcf86cd799439021 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "street": "456 Park Avenue",
    "city": "Los Angeles",
    "state": "CA"
  }'
```

**Response (200 OK):**

```json
{
  "message": "Address updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439021",
    "street": "456 Park Avenue",
    "city": "Los Angeles",
    "state": "CA"
  }
}
```

---

### 24. Delete Address

**DELETE** `/addresses/:id`

**Request:**

```bash
curl -X DELETE http://localhost:3000/api/addresses/507f1f77bcf86cd799439021 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**

```json
{
  "message": "Address deleted successfully"
}
```

---

## Order Endpoints

### 25. Create Order

**POST** `/orders`

**Request:**

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "addressId": "507f1f77bcf86cd799439021",
    "items": [
      {
        "productId": "507f1f77bcf86cd799439012",
        "variantId": "507f1f77bcf86cd799439013",
        "quantity": 2
      }
    ],
    "paymentMethod": "stripe"
  }'
```

**Response (201 Created):**

```json
{
  "message": "Order created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439022",
    "orderNumber": "ORD-2024-001",
    "userId": "507f1f77bcf86cd799439011",
    "items": [
      {
        "productId": "507f1f77bcf86cd799439012",
        "variantId": "507f1f77bcf86cd799439013",
        "quantity": 2,
        "price": 999.99,
        "total": 1999.98
      }
    ],
    "shippingAddress": {
      "fullName": "John Doe",
      "street": "123 Main Street",
      "city": "New York"
    },
    "subtotal": 1999.98,
    "tax": 159.99,
    "shipping": 10.0,
    "totalAmount": 2169.97,
    "status": "pending",
    "paymentStatus": "pending",
    "createdAt": "2024-01-15T12:00:00Z"
  }
}
```

**Error Response (400 Bad Request - Insufficient Stock):**

```json
{
  "message": "Insufficient stock for MacBook Pro 14\""
}
```

---

### 26. Get All Orders

**GET** `/orders`

**Query Parameters:**

- `status` (optional): Filter by status (pending, processing, shipped, delivered, cancelled)
- `page` (optional): Page number
- `limit` (optional): Items per page

**Request:**

```bash
curl -X GET "http://localhost:3000/api/orders?status=shipped&page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**

```json
{
  "message": "Orders retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439022",
      "orderNumber": "ORD-2024-001",
      "totalAmount": 2169.97,
      "status": "shipped",
      "paymentStatus": "paid",
      "createdAt": "2024-01-15T12:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1
  }
}
```

---

### 27. Get Order by ID

**GET** `/orders/:id`

**Request:**

```bash
curl -X GET http://localhost:3000/api/orders/507f1f77bcf86cd799439022 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**

```json
{
  "message": "Order retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439022",
    "orderNumber": "ORD-2024-001",
    "userId": "507f1f77bcf86cd799439011",
    "items": [
      {
        "productId": "507f1f77bcf86cd799439012",
        "variantId": "507f1f77bcf86cd799439013",
        "productName": "Samsung Galaxy S24",
        "color": "Black",
        "quantity": 2,
        "price": 999.99,
        "total": 1999.98
      }
    ],
    "shippingAddress": {
      "fullName": "John Doe",
      "street": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "postalCode": "10001"
    },
    "subtotal": 1999.98,
    "tax": 159.99,
    "shipping": 10.0,
    "totalAmount": 2169.97,
    "status": "shipped",
    "paymentStatus": "paid",
    "paymentMethod": "stripe",
    "trackingNumber": "TRACK123456",
    "createdAt": "2024-01-15T12:00:00Z",
    "updatedAt": "2024-01-16T14:30:00Z"
  }
}
```

---

### 28. Update Order Status (Admin Only)

**PUT** `/orders/:id/status`

**Request:**

```bash
curl -X PUT http://localhost:3000/api/orders/507f1f77bcf86cd799439022/status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shipped",
    "trackingNumber": "TRACK123456"
  }'
```

**Response (200 OK):**

```json
{
  "message": "Order status updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439022",
    "status": "shipped",
    "trackingNumber": "TRACK123456"
  }
}
```

---

### 29. Cancel Order

**POST** `/orders/:id/cancel`

**Request:**

```bash
curl -X POST http://localhost:3000/api/orders/507f1f77bcf86cd799439022/cancel \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Changed my mind"
  }'
```

**Response (200 OK):**

```json
{
  "message": "Order cancelled successfully"
}
```

---

## Payment Endpoints

### 30. Initialize Payment

**POST** `/payments/initialize`

**Request:**

```bash
curl -X POST http://localhost:3000/api/payments/initialize \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "507f1f77bcf86cd799439022",
    "amount": 2169.97,
    "currency": "usd"
  }'
```

**Response (200 OK):**

```json
{
  "message": "Payment initialized",
  "data": {
    "clientSecret": "pi_1234567890_secret_987654",
    "publishableKey": "pk_test_1234567890",
    "orderId": "507f1f77bcf86cd799439022"
  }
}
```

---

### 31. Confirm Payment

**POST** `/payments/confirm`

**Request:**

```bash
curl -X POST http://localhost:3000/api/payments/confirm \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "paymentIntentId": "pi_1234567890",
    "orderId": "507f1f77bcf86cd799439022"
  }'
```

**Response (200 OK):**

```json
{
  "message": "Payment confirmed successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439023",
    "orderId": "507f1f77bcf86cd799439022",
    "amount": 2169.97,
    "status": "succeeded",
    "paymentMethod": "stripe",
    "createdAt": "2024-01-15T12:05:00Z"
  }
}
```

---

### 32. Get Payment Status

**GET** `/payments/:orderId`

**Request:**

```bash
curl -X GET http://localhost:3000/api/payments/507f1f77bcf86cd799439022 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**

```json
{
  "message": "Payment status retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439023",
    "orderId": "507f1f77bcf86cd799439022",
    "amount": 2169.97,
    "currency": "usd",
    "status": "succeeded",
    "paymentIntentId": "pi_1234567890",
    "createdAt": "2024-01-15T12:05:00Z"
  }
}
```

---

## Review & Rating Endpoints

### 33. Create Review

**POST** `/reviews`

**Request:**

```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "507f1f77bcf86cd799439012",
    "orderId": "507f1f77bcf86cd799439022",
    "rating": 5,
    "title": "Excellent product",
    "review": "Very satisfied with my purchase. Great quality and fast shipping."
  }'
```

**Response (201 Created):**

```json
{
  "message": "Review created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439024",
    "productId": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "rating": 5,
    "title": "Excellent product",
    "review": "Very satisfied with my purchase.",
    "helpful": 0,
    "createdAt": "2024-01-15T12:10:00Z"
  }
}
```

---

### 34. Get Product Reviews

**GET** `/reviews/product/:productId`

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `rating` (optional): Filter by rating

**Request:**

```bash
curl -X GET "http://localhost:3000/api/reviews/product/507f1f77bcf86cd799439012?rating=5" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**

```json
{
  "message": "Reviews retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439024",
      "userId": {
        "name": "John Doe"
      },
      "rating": 5,
      "title": "Excellent product",
      "review": "Very satisfied with my purchase.",
      "helpful": 0,
      "createdAt": "2024-01-15T12:10:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1
  }
}
```

---

### 35. Update Review

**PUT** `/reviews/:id`

**Request:**

```bash
curl -X PUT http://localhost:3000/api/reviews/507f1f77bcf86cd799439024 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4,
    "review": "Good product, minor issues"
  }'
```

**Response (200 OK):**

```json
{
  "message": "Review updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439024",
    "rating": 4,
    "review": "Good product, minor issues"
  }
}
```

---

### 36. Delete Review

**DELETE** `/reviews/:id`

**Request:**

```bash
curl -X DELETE http://localhost:3000/api/reviews/507f1f77bcf86cd799439024 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**

```json
{
  "message": "Review deleted successfully"
}
```

---

## Admin Endpoints

### 37. Get Dashboard Statistics (Admin Only)

**GET** `/admin/stats`

**Request:**

```bash
curl -X GET http://localhost:3000/api/admin/stats \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**

```json
{
  "message": "Stats retrieved successfully",
  "data": {
    "totalUsers": 150,
    "totalProducts": 85,
    "totalOrders": 320,
    "totalRevenue": 125000.0,
    "pendingOrders": 12,
    "recentOrders": [
      {
        "orderNumber": "ORD-2024-001",
        "totalAmount": 2169.97,
        "createdAt": "2024-01-15T12:00:00Z"
      }
    ]
  }
}
```

---

### 38. Get All Users (Admin Only)

**GET** `/admin/users`

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `role` (optional): Filter by role

**Request:**

```bash
curl -X GET "http://localhost:3000/api/admin/users?page=1&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**

```json
{
  "message": "Users retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "createdAt": "2024-01-10T08:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 8,
    "totalItems": 150
  }
}
```

---

### 39. Update User Role (Admin Only)

**PUT** `/admin/users/:id/role`

**Request:**

```bash
curl -X PUT http://localhost:3000/api/admin/users/507f1f77bcf86cd799439011/role \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin"
  }'
```

**Response (200 OK):**

```json
{
  "message": "User role updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "role": "admin"
  }
}
```

---

### 40. Get All Orders (Admin Only)

**GET** `/admin/orders`

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status

**Request:**

```bash
curl -X GET "http://localhost:3000/api/admin/orders?status=pending&page=1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**

```json
{
  "message": "Orders retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439022",
      "orderNumber": "ORD-2024-001",
      "userName": "John Doe",
      "totalAmount": 2169.97,
      "status": "pending",
      "createdAt": "2024-01-15T12:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 12
  }
}
```

---

## Error Responses

### Common Error Codes

**400 Bad Request:**

```json
{
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Invalid email format" }]
}
```

**401 Unauthorized:**

```json
{
  "message": "Authentication required"
}
```

**403 Forbidden:**

```json
{
  "message": "Access denied"
}
```

**404 Not Found:**

```json
{
  "message": "Resource not found"
}
```

**409 Conflict:**

```json
{
  "message": "Resource already exists"
}
```

**500 Internal Server Error:**

```json
{
  "message": "Internal server error"
}
```

---

## Rate Limiting

- **Requests per minute**: 100 (per IP)
- **Requests per hour**: 5000 (per IP)

Response headers include:

- `X-RateLimit-Limit`: Total allowed requests
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time until reset in seconds

---

## Authentication Notes

1. **Access Token**: Valid for 15 minutes
2. **Refresh Token**: Valid for 7 days
3. **Token Format**: JWT (JSON Web Token)
4. **Storage**: Store tokens securely (HttpOnly cookies recommended)

---

## File Upload

For endpoints supporting file uploads, use multipart/form-data:

```bash
curl -X POST http://localhost:3000/api/products/upload \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "image=@/path/to/image.jpg"
```

Supported formats: JPG, PNG, GIF, WebP (Max: 10MB)

---

## Pagination

All list endpoints support pagination with these query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Response includes pagination object:

```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 45,
    "itemsPerPage": 10
  }
}
```

---

## Filtering & Sorting

Endpoints support filtering and sorting:

- `sort`: Field name (prefix with `-` for descending)
- Filter by any field: `?fieldName=value`

Example:

```bash
curl -X GET "http://localhost:3000/api/products?sort=-createdAt&minPrice=100&maxPrice=1000"
```

---

## Webhook Events

Available webhook events for Stripe integration:

- `charge.succeeded`
- `charge.failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Configure webhook endpoint:

```
POST /api/webhooks/stripe
```

---

**Last Updated**: January 2024
**API Version**: 1.0.0
