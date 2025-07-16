# Shopify App: Confirm COD Partial Payment

This project is a Shopify app built with the [Remix](https://remix.run) framework, featuring a custom Checkout UI Extension that enables partial payment collection for Cash on Delivery (COD) orders.

## Features

- **Partial Payment for COD:**  
  When a customer selects Cash on Delivery at checkout, the extension requires a 10% upfront payment to confirm the order. The remaining amount is collected on delivery.
- **Dynamic Payment Link Generation:**  
  The extension generates a unique payment link for the partial payment and displays it to the customer.
- **Checkout Blocking:**  
  The extension blocks checkout completion until the partial payment is made, ensuring only confirmed COD orders proceed.
- **Shopify App Integration:**  
  Built using Shopify's Remix app template, with support for authentication, webhooks, and database storage via Prisma.

## Project Structure

- `/app` — Main Remix app (Shopify authentication, routes, webhooks, etc.)
- `/extensions/confirm-cod-payment` — Checkout UI Extension for partial COD payment
- `/prisma` — Prisma schema and migrations for database
- `/server` — Custom server logic (e.g., Razorpay integration)
- `shopify.app.toml` / `shopify.web.toml` — Shopify app configuration

## Setup

### Prerequisites

- Node.js (v16+ recommended)
- Shopify Partner account and development store
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- (Optional) Razorpay/Stripe/PayPal account for payment link generation

### Installation

1. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```

2. **Set up environment variables:**  
   Copy `.env.example` to `.env` and fill in your Shopify API keys and other secrets.

3. **Run database migrations:**
   ```sh
   npx prisma migrate dev
   ```

4. **Start the app:**
   ```sh
   npm run dev
   # or
   yarn dev
   ```

5. **Install the app on your Shopify development store.**

## Usage

### Confirm COD Partial Payment Extension

- When a customer selects "Cash on Delivery" at checkout, the extension:
  - Calculates 10% of the order total as the required partial payment.
  - Generates a payment link (e.g., via Razorpay or your chosen provider).
  - Displays the link for the customer to copy and pay in a new tab.
  - Blocks checkout completion until payment is confirmed.

#### Extension UI Example

- **Banner:** Informs the customer about the partial payment requirement.
- **Button:** "Pay 10% Now" — generates and displays the payment link.
- **Payment Link:** Shown as plain text for copy-paste (Shopify UI Extensions do not support clickable links).
- **Success/Error Banners:** Inform the customer of payment status.

### Customization

- To use a different payment provider, update the payment link generation logic in `extensions/confirm-cod-payment/src/Checkout.jsx` and any relevant backend API routes.

## Development

- The extension source is in `extensions/confirm-cod-payment/src/Checkout.jsx`.
- See [Shopify Checkout UI Extension docs](https://shopify.dev/docs/api/checkout-ui-extensions) for available APIs and components.
- The extension is registered in `shopify.extension.toml`.

## Limitations

- **No `<a>` tags or direct links:** Shopify UI Extensions do not support HTML `<a>` tags. Payment links must be shown as plain text.
- **No `window.open`:** Extensions cannot programmatically open new tabs/windows.
- **Copy-paste required:** Customers must copy and paste the payment link into a new tab.

## Resources

- [Shopify App Development Docs](https://shopify.dev/docs/apps)
- [Checkout UI Extensions](https://shopify.dev/docs/api/checkout-ui-extensions)
- [Remix Framework](https://remix.run/docs/en/main)
- [Prisma ORM](https://www.prisma.io/docs/)

---

## License

MIT

## Common Commands

Below are the most common commands you'll use for development, setup, and deployment. Use either `npm` or `yarn` as your package manager.

### Install dependencies
```sh
npm install
# or
yarn install
```

### Start development server
```sh
npm run dev
# or
yarn dev
```

### Build for production
```sh
npm run build
# or
yarn build
```

### Run database migrations (Prisma)
```sh
npx prisma migrate dev
```

### Deploy database migrations (production)
```sh
npx prisma migrate deploy
```

### Generate Prisma client
```sh
npx prisma generate
```

### Run tests (if tests are present)
```sh
npm test
# or
yarn test
```

### Lint code
```sh
npm run lint
# or
yarn lint
```

### Format code
```sh
npm run format
# or
yarn format
```
