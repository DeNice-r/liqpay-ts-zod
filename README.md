# LiqPay Library

A TypeScript library for integrating with LiqPay payment gateway, providing secure payment processing and form generation capabilities.

## Overview

This library simplifies LiqPay integration by providing:
- Type-safe payment parameter validation using Zod schemas
- Automatic signature generation for secure API communication
- Payment form generation for frontend integration
- API methods for programmatic payment processing
- Support for various payment actions including one-time payments, holds, subscriptions, and donations

## Environment Variables

Before using the library, set up the required environment variables:

```bash
LIQPAY_PUBLIC_KEY=your_liqpay_public_key
LIQPAY_PRIVATE_KEY=your_liqpay_private_key
URL=https://yourdomain.com  # Base URL for result callbacks
```

## Core Functions

### `api(params, options?)`

Processes payments through LiqPay API and returns a redirect URL.

```typescript
import { api } from './index';

try {
  const redirectUrl = await api({
    amount: 100,
    currency: 'UAH',
    action: 'pay',
    description: 'Order #123'
  });
  
  // Redirect user to this URL to complete payment
  console.log('Payment URL:', redirectUrl);
} catch (error) {
  console.error('Payment failed:', error);
}
```

**Parameters:**
- `params` - Payment parameters object (validated against CNBSchema)
- `options` - Optional configuration object with `path` property (default: 'checkout')

**Returns:** Promise that resolves to a redirect URL string

### `getForm(params?)`

Generates an HTML form for frontend payment integration.

```typescript
import { getForm } from './index';

const paymentForm = getForm({
  amount: 250,
  currency: 'USD',
  action: 'pay',
  description: 'Premium subscription'
});

// Insert the form HTML into your page
document.getElementById('payment-container').innerHTML = paymentForm;
```

**Returns:** HTML string containing a complete payment form with LiqPay SDK integration

### `getVerifiedData(params)`

Creates verified data and signature for custom integrations.

```typescript
import { getVerifiedData } from './index';

const { params, data, signature } = getVerifiedData({
  amount: 500,
  currency: 'EUR',
  action: 'subscribe',
  subscribe_periodicity: 'month'
});

// Use data and signature for custom API calls
```

**Returns:** Object containing validated params, base64-encoded data, and signature

### `getCNBObject(params)`

Simplified version of `getVerifiedData` that returns only data and signature.

```typescript
import { getCNBObject } from './index';

const { data, signature } = getCNBObject({
  amount: 75,
  action: 'paydonate'
});
```

## Payment Parameters

### Required Parameters

All payment parameters are optional due to defaults, but you'll typically want to specify:

- `amount` - Payment amount (number or string, default: 20)
- `currency` - Payment currency (default: 'UAH')
- `action` - Payment action type (default: 'pay')
- `description` - Payment description (default: 'Пожертва команді Soulful')

### Supported Payment Actions

```typescript
enum PaymentAction {
  PAY = 'pay',           // One-time payment
  HOLD = 'hold',         // Authorization hold
  SUBSCRIBE = 'subscribe', // Recurring subscription
  PAYDONATE = 'paydonate' // Donation payment
}
```

### Supported Currencies

```typescript
enum PaymentCurrency {
  UAH = 'UAH',  // Ukrainian Hryvnia
  USD = 'USD',  // US Dollar
  EUR = 'EUR'   // Euro
}
```

### Subscription Parameters

For subscription payments (`action: 'subscribe'`):

```typescript
{
  action: 'subscribe',
  amount: 100,
  subscribe_periodicity: 'month', // 'day', 'month', or 'year'
  subscribe_date_start: '2024-01-01 00:00:00'
}
```

## Usage Examples

### Basic One-time Payment

```typescript
const paymentUrl = await api({
  amount: 1000,
  currency: 'UAH',
  description: 'Product purchase'
});
```

### Monthly Subscription

```typescript
const subscriptionForm = getForm({
  amount: 299,
  currency: 'USD',
  action: 'subscribe',
  subscribe_periodicity: 'month',
  description: 'Monthly premium subscription'
});
```

### Donation with Custom Amount

```typescript
const donationData = getCNBObject({
  amount: userAmount,
  action: 'paydonate',
  currency: 'EUR',
  description: `Donation from ${userName}`
});
```

### Authorization Hold

```typescript
const holdUrl = await api({
  amount: 500,
  action: 'hold',
  description: 'Hotel reservation hold'
});
```

## Language Support

The library supports Ukrainian and English interfaces:

```typescript
enum PaymentLanguage {
  UK = 'uk',  // Ukrainian (default)
  EN = 'en'   // English
}
```

Payment forms will display buttons in the selected language:
- Ukrainian: "Сплатити"
- English: "Pay"

## Security Features

- **Automatic signature generation** - All requests are automatically signed using SHA1 hash
- **Parameter validation** - Zod schemas ensure type safety and data integrity
- **Environment variable protection** - Sensitive keys are loaded from environment variables
- **Base64 encoding** - Payment data is properly encoded for transmission

## Error Handling

The library includes robust error handling:

```typescript
try {
  const result = await api(paymentParams);
  // Handle successful payment initiation
} catch (error) {
  if (error.message === 'Failed to get response from Liqpay') {
    // Handle LiqPay API errors
  }
  // Handle other errors
}
```

## Integration Patterns

### Frontend Integration

```html
<!DOCTYPE html>
<html>
<head>
    <title>Payment</title>
</head>
<body>
    <div id="payment-form"></div>
    
    <script>
        // Get form HTML from your backend
        fetch('/api/payment-form', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: 100, description: 'Order #123' })
        })
        .then(response => response.text())
        .then(formHtml => {
            document.getElementById('payment-form').innerHTML = formHtml;
        });
    </script>
</body>
</html>
```

### Backend API Endpoint

```typescript
app.post('/api/payment-form', (req, res) => {
    const { amount, description } = req.body;
    
    const form = getForm({
        amount,
        description,
        result_url: `${process.env.URL}/payment/success`
    });
    
    res.send(form);
});
```

### Custom Payment Flow

```typescript
// 1. Generate payment data
const { data, signature } = getCNBObject(paymentParams);

// 2. Store payment info in database
await savePaymentAttempt({ data, signature, userId });

// 3. Redirect to LiqPay
const paymentUrl = await api(paymentParams);
res.redirect(paymentUrl);
```

## Notes

- The library uses LiqPay API version 3 by default
- All amounts should be specified in the smallest currency unit (e.g., kopecks for UAH, cents for USD)
- The `result_url` parameter automatically includes your domain from the `URL` environment variable
- Payment forms include the official LiqPay SDK for enhanced security and user experience

