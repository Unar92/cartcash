/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SHOPIFY_SHOP_NAME: process.env.SHOPIFY_SHOP_NAME,
    SHOPIFY_API_VERSION: process.env.SHOPIFY_API_VERSION,
    SHOPIFY_ACCESS_TOKEN: process.env.SHOPIFY_ACCESS_TOKEN,
    SHOPIFY_STOREFRONT_PASSWORD: process.env.SHOPIFY_STOREFRONT_PASSWORD,
  }
};

module.exports = nextConfig;
