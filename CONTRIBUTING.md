# Nuxt Stripe Payments Module

This is a Nuxt module for easy Stripe payment integration.

## Development

```bash
# Install dependencies
npm install

# Prepare the module (stub build for development)
npm run dev:prepare

# Run playground in development mode
npm run dev

# Build the playground
npm run dev:build

# Run linting
npm run lint

# Run tests
npm run test
```

## Publishing

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Run `npm run prepack` to build
4. Run `npm publish`

Or use the release script:

```bash
npm run release
```

## Module Structure

```
nuxt-stripe-payments/
├── src/
│   ├── module.ts                 # Module entry point
│   ├── runtime.d.ts              # TypeScript declarations
│   └── runtime/
│       ├── components/
│       │   └── StripePayment.vue # Payment component
│       └── composables/
│           └── useStripe.ts      # Stripe loader composable
├── playground/                   # Test app
│   ├── nuxt.config.ts
│   ├── app.vue
│   ├── pages/
│   └── server/
│       └── api/
│           └── create-payment-intent.post.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Testing

The playground app includes a full working example with Stripe integration.

## License

MIT
