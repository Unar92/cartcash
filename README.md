# CartCash - Shopify Abandoned Cart Management

A secure Next.js application for managing Shopify abandoned carts with OAuth authentication.

## Features

- 🔐 Secure Shopify OAuth authentication
- 📊 Abandoned cart dashboard with analytics
- 🎨 Dark/Light mode support
- 📱 Responsive design
- 📈 CSV export functionality
- 🔄 Real-time cart data
- 🚀 **No environment variables required** - Enter credentials directly in the app

## Getting Started

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd cartcash
npm install
```

### 2. Authentication Setup

**No environment variables needed!** Simply start the app and enter your credentials through the web interface.

#### Two Authentication Options:

1. **Access Token (Recommended - No Setup Required)**
   - Create a private app in your Shopify store admin
   - Works immediately without any environment variables
   - Perfect for development and simple use cases

2. **OAuth (Advanced - Optional Setup)**
   - Requires Shopify app setup and environment variables
   - More secure for production applications
   - See setup instructions below

### 3. OAuth Setup (Optional - For Advanced Users)

If you want to use OAuth authentication instead of access tokens:

1. **Create a Shopify App:**
   - Go to your Shopify Partner dashboard
   - Create a new app
   - Add these scopes: `read_orders`, `read_customers`, `read_content`
   - Set redirect URL to: `http://localhost:3000/api/auth/callback`

2. **Set Environment Variables:**
   Create a `.env.local` file with:
   ```env
   SHOPIFY_API_KEY=your_app_api_key_from_shopify
   SHOPIFY_API_SECRET=your_app_secret_from_shopify
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Restart the Application:**
   ```bash
   npm run dev
   ```

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### 5. Using the Application

1. **First Visit**: You'll see a login form with authentication options:
   - **Access Token** (selected by default - works without setup)
   - **OAuth** (only available if environment variables are configured)

2. **Enter Your Credentials**: Input your Shopify store domain and access credentials

3. **After Authentication**: You'll be redirected to the dashboard where you can:
   - View abandoned carts
   - Filter by date range
   - Export data to CSV
   - Manage cart recovery campaigns

4. **Session Management**: Your authentication session will persist across browser sessions

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
