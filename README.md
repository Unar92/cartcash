# CartCash - Shopify Abandoned Cart Management

A secure Next.js application for managing Shopify abandoned carts with OAuth authentication.

## Features

- 🔐 Secure Shopify OAuth authentication
- 📊 Abandoned cart dashboard with analytics
- 🎨 Dark/Light mode support
- 📱 Responsive design
- 📈 CSV export functionality
- 🔄 Real-time cart data

## Getting Started

### 1. Environment Setup

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your Shopify credentials:

#### For OAuth Authentication (Production):
```env
SHOPIFY_API_KEY=your_app_api_key_from_shopify
SHOPIFY_API_SECRET=your_app_secret_from_shopify
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### For Static Token Authentication (Development):
```env
SHOPIFY_SHOP_NAME=your-shop-name
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**How to get your Shopify Access Token:**
1. Go to your Shopify store admin
2. Navigate to **Apps** → **Create private app**
3. Name your app (e.g., "CartCash Development")
4. Grant these permissions:
   - **Store settings**: `read_content`
   - **Orders**: `read_orders`
   - **Customers**: `read_customers`
5. Click **Save** and copy the **Access token** (starts with `shpat_`)

> **Note**: You can only use one authentication method at a time. Choose either OAuth OR static token, not both.

### 2. Authentication Setup

Choose one of the following authentication methods:

#### Option A: OAuth (Recommended for production)
1. Create a Shopify app in your Shopify Partner dashboard
2. Add the following scopes:
   - `read_orders`
   - `read_customers`
   - `read_content`
3. Set your app's redirect URLs to:
   - `http://localhost:3000/api/auth/callback`
4. Add these environment variables:
   ```env
   SHOPIFY_API_KEY=your_api_key_from_shopify_app
   SHOPIFY_API_SECRET=your_api_secret_from_shopify_app
   ```

#### Option B: Static Token (Simple for development)
1. Create a private app in your Shopify store admin
2. Grant the following permissions:
   - Store settings: `read_content`
   - Orders: `read_orders`
   - Customers: `read_customers`
3. Use the generated access token with your shop name:
   ```env
   SHOPIFY_SHOP_NAME=your-shop-name
   SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the login page.

### 5. Using the Application

1. **First Visit**: You'll see a login form with two authentication options:
   - **OAuth**: Recommended for production (requires Shopify app setup)
   - **Access Token**: Simple setup for development (requires private app)

2. **After Authentication**: You'll be redirected to the dashboard where you can:
   - View abandoned carts
   - Filter by date range
   - Export data to CSV
   - Manage cart recovery campaigns

3. **Session Management**: Your authentication session will persist across browser sessions

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
