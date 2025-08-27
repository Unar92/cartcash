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

## Quick Start

### Installation

```bash
git clone <repository-url>
cd cartcash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and enter your Shopify credentials through the web interface.

### Authentication Setup

**No environment variables needed!** Two authentication options available:

1. **Access Token (Recommended)** - Create a private app in Shopify admin
2. **OAuth (Advanced)** - Requires Shopify app setup with environment variables

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Shopify store with admin access

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run linting
npm run lint
```

### Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
├── providers/          # Context providers
├── utils/              # Utility functions
└── types/              # TypeScript definitions
```

### Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and patterns
- Write tests for new features
- Update documentation as needed
- Ensure responsive design works across devices
- Test authentication flows thoroughly

## Support & Feedback

### Getting Help

- 📖 **Documentation**: Check this README and inline code comments
- 🐛 **Bug Reports**: [Open an issue](https://github.com/your-repo/issues) with details
- 💡 **Feature Requests**: [Start a discussion](https://github.com/your-repo/discussions)
- 💬 **Community**: Join our [Discord community](#) for real-time support

### Reporting Issues

When reporting bugs, please include:

- Steps to reproduce the issue
- Expected vs actual behavior
- Browser and OS information
- Shopify store setup details (if relevant)
- Any error messages or console logs

### Feature Requests

We love hearing your ideas! When suggesting new features:

- Describe the problem you're trying to solve
- Explain how the feature would work
- Provide use cases or examples
- Consider alternative solutions

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to your preferred platform (Vercel, Netlify, etc.)

### Environment Variables (Optional)

For OAuth authentication in production:
```env
SHOPIFY_API_KEY=your_app_api_key
SHOPIFY_API_SECRET=your_app_secret
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Shopify API integration
- Community contributors
