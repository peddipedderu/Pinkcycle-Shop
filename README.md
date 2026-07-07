# Pinkcycle Shop - Comprehensive Web & Mobile Marketplace System

**Deployment URLs:**
- **Web Frontend Application:** [https://pinkcycle.co.ke](https://pinkcycle.co.ke) (redirects to `/app/`)
- **Backend API Services:** [https://pinkcycle.co.ke/api/](https://pinkcycle.co.ke/api/)
- **Django Administration Portal:** [https://pinkcycle.co.ke/admin/](https://pinkcycle.co.ke/admin/)

---

## 1. Executive Summary & Project Defense

Pinkcycle Shop is a modern, end-to-end e-commerce and community platform specifically tailored to support women's health, wellness, and local commerce in Kenya. This system was designed with a **client-server decoupled architecture**, comprising:
1. **A Unified Frontend (Web & Mobile):** Built using **React Native and Expo**, compiling to a Native Android App (optimized for mobile-first users in Kenya) and a Progressive Web App (PWA) served under `/app/` on the main domain.
2. **A Robust Backend (REST API & SSR):** Powered by **Django & Django REST Framework (DRF)**, handling complex business logic, relational data modeling, transactional orders, secure user profiles, content management (blogs/community), and payment gateways.
3. **Enterprise Reverse Proxy Setup:** Orchestrated via **Apache**, routing public requests to local static folders (for maximum delivery speed of the React web app) and proxying dynamic requests to **Gunicorn** (running the WSGI application) and **Daphne** (for real-time WebSockets).

### System Defense Strategy (For Academic Presentation)
* **Decoupled Architecture:** Separating the client applications from backend logic ensures the backend functions as a single source of truth (via stateless APIs). This enables the frontend to scale independently (e.g., adding an iOS client or a smartwatch widget requires zero changes to the backend).
* **Cross-Platform Expo Engine:** Instead of maintaining separate codebases for Web (HTML/JS) and Mobile (Java/Kotlin for Android, Swift for iOS), the frontend is written once in React Native using React Native Web compatibility. This reduces bug duplication, coordinates branding assets, and speeds up time-to-market.
* **Hybrid Backend Utility:** The backend is configured as a hybrid engine. It exposes a fully structured REST API (`/api/`) for the React client while retaining Django's built-in Admin panel (`/admin/`) and standard templates for server-side management.
* **Resilient M-Pesa Integration:** Integrating Lipa Na M-Pesa STK Push directly into the transactional order model guarantees instant mobile payments with background webhooks to secure order state.

---

## 2. High-Level System Architecture

The diagram below shows how the clients, web proxy, web applications, and database engines interact:

```mermaid
graph TD
    %% Clients
    MobileApp[Native Android App] -->|HTTPS Requests| ApacheProxy[Apache Web Server:80/443]
    WebBrowser[PWA Browser Client] -->|HTTPS Requests| ApacheProxy
    
    %% Apache Routing
    ApacheProxy -->|Serves Static Files directly| StaticRoot[/var/www/html/app/]
    ApacheProxy -->|Proxies /api & /admin| Gunicorn[Gunicorn WSGI Server:8000]
    ApacheProxy -->|Proxies /ws/ WebSockets| Daphne[Daphne ASGI Server:8001]
    
    %% App Servers
    Gunicorn -->|Django Application| DjangoBackend[Django Core & DRF APIs]
    Daphne -->|Channels / WebSockets| DjangoBackend
    
    %% Integrations & DB
    DjangoBackend -->|Relational Queries| SQLiteDB[(SQLite Database)]
    DjangoBackend -->|Triggers SMS/Callbacks| SafaricomAPI[Safaricom Daraja API: M-Pesa]
    DjangoBackend -->|REST Calls| PayPalAPI[PayPal REST API]
    DjangoBackend -->|HTTPS Requests| StripeAPI[Stripe API]
    DjangoBackend -->|Exchanges OAuth Code| GoogleOAuth[Google OAuth 2.0 Services]
```

---

## 3. Technology Stack & Key Dependencies

### Frontend (Mobile & Web)
* **Framework:** React Native + Expo (v49.0)
* **Navigation:** React Navigation (`@react-navigation/native-stack`, `@react-navigation/bottom-tabs`, `@react-navigation/drawer`)
* **State Management & Form Validation:** Formik (form validation states) & Yup (validation schemas)
* **HTTP Client:** Axios (configured with interceptors to inject authorization tokens)
* **Web Integration:** `react-native-web` & `@expo/webpack-config` for compiling mobile components into standard HTML5 DOM elements
* **Storage:** AsyncStorage (for mobile session token caching) & standard `localStorage` (for web-compiled sessions)

### Backend (Core & APIs)
* **Framework:** Django (v5.0)
* **API Engine:** Django REST Framework (DRF)
* **Web Server Gateway Interface:** Gunicorn (production application server)
* **Asynchronous Server Gateway Interface:** Daphne (WebSockets)
* **Authentication:** DRF TokenAuthentication & Google OAuth client APIs
* **Database:** SQLite (`db.sqlite3`) for robust file-based storage
* **Payment Packages:** `django-daraja` (Safaricom M-Pesa integration)
* **Network Requests:** `requests` library (for custom PayPal integrations) and `stripe` python SDK

---

## 4. Database Schema & Core Models

The database contains models grouped by their domain roles. All relationships enforce referential integrity using Cascade or Set Null constraints.

```mermaid
erDiagram
    USER {
        int id PK
        string username
        string email
        string first_name
        string last_name
        boolean is_superuser
    }
    
    CATEGORY {
        int id PK
        string name
        string slug
        string description
        string image
        int parent_id FK
        boolean is_featured
    }
    
    PRODUCT {
        int id PK
        int category_id FK
        int brand_id FK
        string name
        string slug
        string image
        string description
        decimal price
        decimal original_price
        boolean available
        int stock
        string condition
        string sku
    }

    BRAND {
        int id PK
        string name
        string slug
        string logo
    }

    TAG {
        int id PK
        string name
        string slug
    }

    PRODUCT_TAGS {
        int product_id FK
        int tag_id FK
    }
    
    ORDER {
        int id PK
        string first_name
        string last_name
        string email
        string phone
        string address
        string city
        string postal_code
        boolean paid
        string status
        string payment_method
        string mpesa_checkout_id
        string mpesa_receipt_number
        string paypal_order_id
        string stripe_payment_intent
        decimal discount_amount
        decimal shipping_amount
    }
    
    ORDER_ITEM {
        int id PK
        int order_id FK
        int product_id FK
        decimal price
        int quantity
    }

    COUPON {
        int id PK
        string code
        datetime valid_from
        datetime valid_to
        decimal discount_value
        string discount_type
        boolean is_active
    }

    USER ||--o{ WISHLIST : maintains
    USER ||--o{ REVIEW : reviews
    CATEGORY ||--o{ CATEGORY : hierarchical
    CATEGORY ||--o{ PRODUCT : contains
    BRAND ||--o{ PRODUCT : manufactures
    PRODUCT }|--o{ TAG : has
    ORDER ||--o{ ORDER_ITEM : includes
    PRODUCT ||--o{ ORDER_ITEM : sells
```

### Core Models Breakdown
1. **Category:** Supports parent-child hierarchies (`parent` field points to self) to organize categories into subcategories (e.g., *Personal Care* -> *Sanitary Products*).
2. **Product:** Tracks conditions (`new`, `used`, `refurbished`), physical variables (`weight`, `dimensions`), availability, stock levels, and original vs. current price (for discount calculations).
3. **Order:** Serves as the transactional record. Contains shipping info, payment identifiers (`mpesa_checkout_id`, `paypal_order_id`, `stripe_payment_intent`), payment status (`paid` boolean), and cost breakdowns (`discount_amount`, `shipping_amount`).
4. **OrderItem:** Relates a specific quantity of a product to an order, taking a snapshot of the product price at the time of transaction.
5. **Coupon:** Holds code strings, active flags, date range validity, and discount rules (percentage or flat amount).

---

## 5. API Endpoint Specifications

All REST endpoints operate under `/api/` path and exchange data in JSON format.

| Path | Controller Class | HTTP Methods | Authenticated? | Role |
| :--- | :--- | :--- | :--- | :--- |
| `/api/register/` | `RegisterView` | `POST` | No | Creates a new user profile. |
| `/api/login/` | `UserAccountViewSet` | `POST` | No | Authenticates credentials; returns user object & DRF Auth Token. |
| `/api/account/google_login/` | `UserAccountViewSet` | `POST` | No | Authenticates Google Access Token/Authorization Code. |
| `/api/account/` | `UserAccountViewSet` | `GET`, `PUT` | Yes | Retrieves profile info, total orders/bookings/wishlist counts; edits profile. |
| `/api/products/` | `ProductViewSet` | `GET`, `POST` | `GET` (No) / `POST` (Yes) | Retrieves product catalog (supports filters); creates products (vendors/admins). |
| `/api/categories/` | `CategoryViewSet` | `GET`, `POST` | `GET` (No) / `POST` (Yes) | Retrieves marketplace categories; creates new ones. |
| `/api/cart/` | `CartViewSet` | `GET`, `POST`, `DELETE` | No (Session-based) | Performs CRUD operations on items added to the cart. |
| `/api/checkout/shipping/` | `CheckoutViewSet` | `POST` | No | Submits billing/shipping details, computes delivery costs, applies coupons, creates order. |
| `/api/payment/lipa_na_mpesa/`| `PaymentViewSet` | `POST` | No | Triggers an M-Pesa STK Push via Daraja API. |
| `/api/payment/callback/` | `PaymentViewSet` | `POST` | No (Webhook) | Receives status callbacks from Safaricom to mark orders as paid. |
| `/api/payment/status/` | `PaymentViewSet` | `GET` | No | Checks payment completion status of a specific order ID. |
| `/api/payment/paypal/create/`| `PaymentViewSet` | `POST` | No | Connects to PayPal API to set up an order approval link. |
| `/api/payment/paypal/capture/`| `PaymentViewSet` | `POST` | No | Captures approved PayPal payments and updates the order status. |
| `/api/payment/stripe/create/`| `PaymentViewSet` | `POST` | No | Sets up Stripe PaymentIntent client secrets for card payments. |
| `/api/bookings/` | `BookingViewSet` | `GET`, `POST` | Yes | Manages mentorship bookings for wellness, lifeskills, tech, and finance. |
| `/api/sessions/` | `SessionViewSet` | `GET` | No | Lists workshop sessions filtered by department categories. |

---

## 6. Authentication Details

The Pinkcycle Shop handles authentication securely through two major flows:

### A. Credentials Login (Username/Email & Password)
1. The user inputs their username (or email) and password.
2. The frontend sends a POST request to `/api/login/`.
3. The backend checks credentials using standard Django authentication backend.
4. On success, the backend retrieves or generates a unique hexadecimal key using Django REST Framework's Token system:
   ```json
   {
     "token": "a1b2c3d4e5f6g7h8i9j0...",
     "user": {
       "id": 1,
       "username": "jane_doe",
       "email": "jane@example.com"
     }
   }
   ```
5. The frontend interceptor saves this token:
   * **Web:** Cached in `localStorage.setItem('userToken', token)`.
   * **Mobile (iOS/Android):** Cached using `@react-native-async-storage/async-storage` via `AsyncStorage.setItem('token', token)`.
6. Subsequent requests automatically inject this token into the HTTP Headers:
   `Authorization: Token a1b2c3d4e5f6g7h8i9j0...`

### B. Google OAuth 2.0 Integration
For faster social sign-on, the mobile app and PWA leverage Google OAuth 2.0:
1. The frontend coordinates with the device's Google Sign-In SDK to obtain an **Access Token** or **Authorization Code**.
2. The token is sent to the backend via POST to `/api/account/google_login/`.
3. The backend executes a secure `curl` request to the Google API (`https://www.googleapis.com/oauth2/v3/userinfo?access_token={token}`) to retrieve user details directly from Google.
4. The backend checks if a local user exists with that email address.
   * If yes: Logs them in.
   * If no: Creates a new user account with their Google first name, last name, and email.
5. The backend generates a DRF Auth Token and returns it to the client.

---

## 7. Product Management (How to Add Products)

Products can be onboarded in two ways, ensuring accessibility for different types of administrators/vendors:

### A. Django Administration Panel (`/admin/`)
1. Authorized admins log into `https://pinkcycle.co.ke/admin/` with their superuser credentials.
2. Under the **Shop** section, they can click **Products** -> **Add Product**.
3. The admin inputs details like Category, Brand, Tags, Name, Slug, Price, Original Price, Stock, Condition, and uploads the Product Image.
4. Click **Save** to insert the record.

### B. In-App Mobile/Web Product Onboarding (For Vendors)
The frontend app includes an `AddProduct` interface (located in `frontend/src/screens/shop/AddProduct.js`):
1. The screen downloads active categories from `/api/categories/` to populate a category dropdown.
2. The user fills out a visual form: selects a category, sets name, price, stock condition, and inputs a description.
3. The user picks a product image using `expo-image-picker`.
4. Upon submission, the React client builds a `FormData` package to support multipart file uploads:
   ```javascript
   const data = new FormData();
   data.append("name", form.name);
   data.append("slug", form.name.toLowerCase().replace(/ /g, '-'));
   data.append("category", form.category);
   data.append("description", form.description);
   data.append("price", form.price);
   data.append("available", form.available);
   if (photo) {
       data.append("image", { uri: photo, name: "product.jpg", type: "image/jpg" });
   }
   ```
5. A POST request is fired to `/api/products/` with header `'Content-Type': 'multipart/form-data'`. The DRF API processes the payload, saves the uploaded image to the server's filesystem, and registers the database row.

---

## 8. Integrated Payment Methods

The system supports multiple payment options to cater to localized and international buyers.

### A. Safaricom Lipa Na M-Pesa (Daraja API)
This is the primary payment channel for mobile users in Kenya.
1. The user inputs their M-Pesa number (e.g. `0743192968`) on the payment screen.
2. The frontend triggers a POST request to `/api/payment/lipa_na_mpesa/` passing the phone number, transaction amount, and order ID.
3. The backend formats the phone number (to international standard `2547...`) and initiates an **STK Push** via Safaricom's `MpesaClient`:
   * The client connects to Daraja and fires an STK request.
   * Safaricom sends a prompt to the user's phone, requesting their M-Pesa PIN.
4. The backend stores the Safaricom `checkout_request_id` on the order and sets the payment method to `mpesa`.
5. Once the user enters their PIN:
   * Safaricom sends an HTTP POST request containing payment status metadata (ResultCode, MpesaReceiptNumber, Amount) to our backend callback endpoint `/api/payment/callback/`.
   * If `ResultCode == 0` (success), the backend marks the order as paid (`paid = True`), changes status to `confirmed`, and records the `mpesa_receipt_number`.
6. Meanwhile, the frontend polls `/api/payment/status/?order_id={id}` every 2 seconds. When it reads `paid: true`, it stops polling and redirects to the **PaymentSuccess** screen.

### B. PayPal REST API
1. The frontend initiates payment by calling `/api/payment/paypal/create/`.
2. The backend authenticates with PayPal sandbox/production endpoint using OAuth credentials to get a Bearer token.
3. The backend registers the transaction intent on PayPal with return and cancel URLs, receiving a `paypal_order_id` and a redirect approval link.
4. The backend saves the `paypal_order_id` on the order, and sends the approval URL back to the frontend.
5. The frontend redirects the user (via browser or linking handler) to PayPal to log in and approve.
6. Upon approval, PayPal redirects back to the return URL. The client fires a final POST to `/api/payment/paypal/capture/` passing the PayPal Order ID.
7. The backend captures the payment, marks the order as paid, and commits.

### C. Stripe API
1. The frontend requests checkout processing from the backend.
2. The backend invokes Stripe's SDK and establishes a `stripe.PaymentIntent` with the order total in cents (e.g. KES total * 100).
3. The backend saves the payment intent ID (`stripe_payment_intent`) on the order, and sends the client secret key back to the frontend.
4. The React app uses the secret key to launch the Stripe card payment form, completing security verification and charging the card.

---

## 9. Shipping & Coupon Engine

### Shipping Cost Calculation
Shipping is computed dynamically on checkout based on the destination city:
* **Nairobi County:** `200 KES` (delivered in 1-2 days).
* **Major Towns** (Mombasa, Kisumu, Nakuru, Eldoret, Thika): `350 KES` (delivered in 2-3 days).
* **Rest of Kenya:** `500 KES` (delivered in 3-5 days).

This calculation occurs inside the `CheckoutViewSet.shipping` method, preventing client-side price tampering.

### Coupon Validation Flow
1. Users enter discount codes (e.g. `SAVE20`) during checkout.
2. The backend looks up the code in the database.
3. It checks that the coupon is active and the current time falls within `valid_from` and `valid_to`.
4. It reads the coupon type:
   * **Percentage:** Deducts `(Cart Total * discount_value) / 100` from the subtotal.
   * **Flat Fee:** Deducts the exact discount value (capped at the total cart value to prevent negative pricing).
5. If valid, the discount is recorded on the order, and the coupon's usage count is incremented.

---

## 10. Server Deployments & Configuration (Defending the Architecture)

To defend this setup during review, understand that the live production server is optimized for high traffic, low latency, and security.

### Web Server (Apache) Configurations
Apache listens on standard web ports `80` (HTTP) and `443` (HTTPS with SSL). It handles three critical responsibilities:
1. **Document Root:** Serves the React Expo compiled HTML5 web app directly from `/var/www/html/app/`. This bypasses python application servers for static files, ensuring fast browser page loads.
2. **Reverse Proxying:** Forwards dynamic requests (APIs and Django administration) to Gunicorn running locally on port 8000 using proxy rules:
   ```apache
   ProxyPass / http://127.0.0.1:8000/
   ProxyPassReverse / http://127.0.0.1:8000/
   ```
3. **Asset Exclusions:** Excludes media and static files directory paths from being proxied to Gunicorn:
   ```apache
   ProxyPass /static !
   ProxyPass /media !
   ProxyPass /app !
   ```
   This allows Apache to serve backend assets (`/static/` and `/media/`) and compiled frontend assets (`/app/`) directly from the server disk.

### Application Server (Gunicorn)
Gunicorn runs in daemon mode, bound to `127.0.0.1:8000`. It manages multiple worker processes (configured with 2 workers and a 120-second timeout) to process Python/Django executions concurrently:
```bash
/var/www/venv/bin/python /var/www/venv/bin/gunicorn \
    --bind 127.0.0.1:8000 \
    --workers 2 \
    --timeout 120 \
    --chdir /var/www/venv/myshop \
    myshop.wsgi:application \
    --pid /var/run/gunicorn.pid \
    --daemon
```
This isolates the execution environment of Django, protecting it behind the Apache reverse proxy.
