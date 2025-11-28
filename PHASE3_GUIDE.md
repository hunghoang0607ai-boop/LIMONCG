# 💳 PHASE 3: CREDIT & PAYMENT SYSTEM - GUIDE

## ✅ COMPLETED FEATURES

### Backend APIs ✅

#### Credit Endpoints:
- `GET /api/v1/credits/packages` - Get all available credit packages
- `GET /api/v1/credits/balance` - Get user's current credit balance
- `GET /api/v1/credits/transactions` - Get transaction history with pagination
- `POST /api/v1/credits/purchase` - Purchase credits (creates Stripe checkout session)
- `GET /api/v1/credits/verify/:sessionId` - Verify payment after Stripe redirect
- `POST /api/v1/credits/deduct` - Deduct credits (for exam unlock)
- `GET /api/v1/credits/orders` - Get all payment orders (Admin only)
- `POST /api/v1/credits/refund/:orderId` - Issue refund (Admin only)

#### Webhook Endpoint:
- `POST /api/v1/webhooks/stripe` - Handle Stripe webhook events

### Frontend Pages ✅

- ✅ **Credit Purchase Page** - `/credits/purchase`
- ✅ **Payment Success Page** - `/credits/success`
- ✅ **Transaction History** - `/credits/history`

### Core Features ✅

#### Credit System:
- ✅ **5 Credit Packages**:
  - Starter Pack: 10 credits - $9.99
  - Basic Pack: 25 credits - $19.99 (20% off)
  - Premium Pack: 50 credits - $34.99 (30% off) - Most Popular
  - Pro Pack: 100 credits - $59.99 (40% off)
  - Ultimate Pack: 200 credits - $99.99 (50% off) - Best Value

#### Payment Integration:
- ✅ **Stripe Checkout** integration
- ✅ Secure payment processing
- ✅ Webhook event handling:
  - `checkout.session.completed` - Add credits on successful payment
  - `checkout.session.async_payment_succeeded` - Handle async payments
  - `checkout.session.async_payment_failed` - Handle failed payments
  - `charge.refunded` - Handle refunds

#### Transaction Management:
- ✅ Complete transaction history
- ✅ Transaction types:
  - PURCHASE - Credit purchase
  - EXAM_UNLOCK - Credits used for exams
  - BONUS - Bonus credits
  - REFUND - Refunded credits
  - ADMIN_ADJUSTMENT - Admin credit management
- ✅ Balance tracking after each transaction

---

## 🗄️ DATABASE MODELS USED

### Credit Packages (Config)
- Defined in `backend/src/config/creditPackages.ts`
- Not stored in database (static configuration)
- Easy to modify packages and pricing

### PaymentOrder
```prisma
model PaymentOrder {
  id                String
  userId            String
  amountUSD         Float
  creditsPurchased  Int
  paymentMethod     PaymentMethod
  paymentStatus     PaymentStatus
  externalPaymentId String?  // Stripe session ID
  metadata          Json?
  paidAt            DateTime?
  createdAt         DateTime
  updatedAt         DateTime
}
```

### CreditTransaction
```prisma
model CreditTransaction {
  id              String
  userId          String
  amount          Int  // Positive or negative
  transactionType TransactionType
  referenceId     String?  // Order ID or Exam ID
  description     String?
  balanceAfter    Int
  createdAt       DateTime
}
```

---

## 🔧 TECHNICAL IMPLEMENTATION

### 1. Stripe Integration

**Create Checkout Session:**
```typescript
// Backend: services/payment.service.ts
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [...],
  mode: 'payment',
  success_url: `${FRONTEND_URL}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${FRONTEND_URL}/credits/purchase`,
  metadata: { userId, packageId, credits },
});
```

**Webhook Handling:**
```typescript
// Verify signature
const event = stripe.webhooks.constructEvent(
  payload,
  signature,
  WEBHOOK_SECRET
);

// Handle event
switch (event.type) {
  case 'checkout.session.completed':
    await addCreditsToUser(session);
    break;
}
```

### 2. Credit Flow

**Purchase Flow:**
```
1. User clicks "Purchase Now" on a package
   ↓
2. Backend creates Stripe checkout session
   ↓
3. User redirected to Stripe payment page
   ↓
4. User completes payment
   ↓
5. Stripe sends webhook to backend
   ↓
6. Backend adds credits to user
   ↓
7. User redirected to success page
   ↓
8. Frontend verifies payment and updates UI
```

**Deduct Flow:**
```
1. User wants to unlock an exam
   ↓
2. Check if user has enough credits
   ↓
3. Deduct credits from user balance
   ↓
4. Create EXAM_UNLOCK transaction
   ↓
5. Grant access to exam
```

### 3. Transaction History

- Paginated list of all transactions
- Shows type, amount, balance after, and date
- Color-coded: green for additions, red for deductions
- Icons for different transaction types

---

## 🚀 SETUP & CONFIGURATION

### 1. Stripe Setup

**Get Stripe Keys:**
1. Go to https://dashboard.stripe.com
2. Get your **Publishable Key** (pk_test_...)
3. Get your **Secret Key** (sk_test_...)
4. Create a webhook endpoint
5. Get your **Webhook Secret** (whsec_...)

**Configure Backend (.env):**
```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

**Configure Frontend (.env):**
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

### 2. Install Stripe Package

```bash
cd backend
npm install stripe

# Check version
npm list stripe
# Should be: stripe@14.9.0 or later
```

### 3. Setup Webhook (Development)

**Option A: Stripe CLI (Recommended for testing)**
```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:5000/api/v1/webhooks/stripe

# This will give you a webhook secret (whsec_...)
# Add it to your .env file
```

**Option B: ngrok (for public URL)**
```bash
# Install ngrok
# https://ngrok.com

# Expose local server
ngrok http 5000

# Use the ngrok URL in Stripe dashboard
# https://your-ngrok-url.ngrok.io/api/v1/webhooks/stripe
```

---

## 🧪 TESTING PHASE 3

### 1. Start Services

```bash
# Start backend
cd backend
npm run dev

# Start frontend
cd frontend
npm run dev

# Start Stripe webhook forwarding (in another terminal)
stripe listen --forward-to localhost:5000/api/v1/webhooks/stripe
```

### 2. Test Credit Packages API

```http
GET http://localhost:5000/api/v1/credits/packages

Response:
{
  "success": true,
  "data": [
    {
      "id": "starter",
      "name": "Starter Pack",
      "credits": 10,
      "priceUSD": 9.99
    },
    ...
  ]
}
```

### 3. Test Credit Purchase Flow

**Step 1: Create Checkout Session**
```http
POST http://localhost:5000/api/v1/credits/purchase
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "packageId": "premium"
}

Response:
{
  "success": true,
  "data": {
    "sessionId": "cs_test_...",
    "url": "https://checkout.stripe.com/c/pay/cs_test_...",
    "package": {...}
  }
}
```

**Step 2: Test Payment**
1. Open the checkout URL in browser
2. Use Stripe test card: `4242 4242 4242 4242`
3. Any future expiry date (e.g., 12/34)
4. Any 3-digit CVC
5. Complete payment

**Step 3: Verify Webhook**
- Check backend console for webhook event
- Check user's credit balance updated
- Check transaction created

### 4. Test Frontend Flow

**Purchase Credits:**
1. Login as student
2. Go to http://localhost:3000/credits/purchase
3. Click "Purchase Now" on any package
4. Complete Stripe payment
5. Should redirect to /credits/success
6. Credits should be added

**View Transactions:**
1. Go to http://localhost:3000/credits/history
2. Should see purchase transaction
3. Check amount, type, and date

### 5. Test Stripe Webhook Locally

```bash
# Use Stripe CLI to trigger test webhook
stripe trigger checkout.session.completed
```

---

## 📝 API EXAMPLES

### Get Credit Packages
```http
GET http://localhost:5000/api/v1/credits/packages
```

### Get Credit Balance
```http
GET http://localhost:5000/api/v1/credits/balance
Authorization: Bearer YOUR_TOKEN
```

### Get Transaction History
```http
GET http://localhost:5000/api/v1/credits/transactions?page=1&limit=10
Authorization: Bearer YOUR_TOKEN
```

### Purchase Credits
```http
POST http://localhost:5000/api/v1/credits/purchase
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "packageId": "premium"
}
```

### Deduct Credits (Internal)
```http
POST http://localhost:5000/api/v1/credits/deduct
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "amount": 5,
  "examId": "exam-123",
  "description": "Unlocked IELTS Practice Test"
}
```

### Admin: Get All Orders
```http
GET http://localhost:5000/api/v1/credits/orders?page=1&limit=10&status=COMPLETED
Authorization: Bearer ADMIN_TOKEN
```

### Admin: Issue Refund
```http
POST http://localhost:5000/api/v1/credits/refund/order-id
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "reason": "Customer request"
}
```

---

## 🎨 FRONTEND FEATURES

### Credit Purchase Page
- Beautiful card-based package selection
- Shows discount badges and savings
- "Most Popular" and "Best Value" badges
- Hover effects and animations
- Instant redirect to Stripe checkout

### Success Page
- Payment verification
- Shows credits added
- Auto-refreshes user balance
- Quick navigation to dashboard or exams

### Transaction History
- Paginated table view
- Color-coded amounts (green/red)
- Icons for transaction types
- Date formatting
- Balance after each transaction

---

## 🔐 SECURITY FEATURES

### Webhook Security:
- ✅ Signature verification (prevents fake webhooks)
- ✅ Idempotency (prevents duplicate processing)
- ✅ Raw body parsing (required for signature verification)

### Payment Security:
- ✅ No credit card data stored
- ✅ PCI compliance via Stripe
- ✅ Secure checkout session
- ✅ HTTPS required in production

### Credit Security:
- ✅ Server-side balance validation
- ✅ Transaction logging
- ✅ Atomic database operations
- ✅ Admin-only refund capability

---

## ⚠️ IMPORTANT NOTES

### Webhook Route Placement
```typescript
// app.ts
// MUST be BEFORE body parser middleware!
app.use('/api/v1/webhooks', webhookRoutes);

// Body parser comes after
app.use(express.json());
```

**Why?** Stripe signature verification requires the raw body, not JSON-parsed body.

### Testing vs Production

**Test Mode:**
- Use test API keys (pk_test_, sk_test_)
- Use test webhook secret (whsec_test_)
- Use test card: 4242 4242 4242 4242
- No real money is charged

**Production Mode:**
- Use live API keys (pk_live_, sk_live_)
- Use live webhook secret (whsec_live_)
- Real credit cards
- Real money is charged

### Stripe Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Insufficient funds: 4000 0000 0000 9995
Expired: 4000 0000 0000 0069

All test cards:
- Expiry: any future date
- CVC: any 3 digits
- ZIP: any 5 digits
```

---

## 🐛 TROUBLESHOOTING

### Webhook not receiving events
**Solution:**
1. Check Stripe CLI is running
2. Verify webhook URL is correct
3. Check firewall/network settings
4. Ensure webhook secret matches

### Signature verification failed
**Solution:**
1. Ensure raw body is being passed (not JSON parsed)
2. Check webhook secret is correct
3. Verify Stripe API version compatibility

### Credits not added after payment
**Solution:**
1. Check webhook logs in backend console
2. Verify checkout.session.completed event received
3. Check database for PaymentOrder and CreditTransaction
4. Check user credits field updated

### Frontend shows old credit balance
**Solution:**
1. Refresh user data after payment success
2. Check Redux store is updated
3. Clear browser cache

---

## 📊 STATISTICS

### Files Created (Phase 3):

**Backend (8 files):**
```
backend/src/
├── config/
│   └── creditPackages.ts           ✅ 89 lines
├── controllers/
│   ├── credit.controller.ts        ✅ 285 lines
│   └── webhook.controller.ts       ✅ 194 lines
├── routes/
│   ├── credit.routes.ts            ✅ 28 lines
│   └── webhook.routes.ts           ✅ 16 lines
└── services/
    └── payment.service.ts          ✅ 129 lines
```

**Frontend (4 files):**
```
frontend/src/
├── pages/student/
│   ├── CreditPurchasePage.tsx      ✅ 212 lines
│   ├── CreditSuccessPage.tsx       ✅ 103 lines
│   └── TransactionHistoryPage.tsx  ✅ 156 lines
└── services/
    └── credit.service.ts           ✅ 77 lines
```

**Updated Files:**
- `backend/src/app.ts` - Added credit & webhook routes
- `frontend/src/App.tsx` - Added credit pages routes
- `frontend/src/components/layouts/StudentLayout.tsx` - Added menu items

---

## 🎯 NEXT STEPS - PHASE 4

Phase 4 will implement **Exam Management - Admin Portal**:

### Features to implement:
- ✅ Create/Edit/Delete exams
- ✅ Question bank management
- ✅ Multiple question types support
- ✅ Rich text editor for questions
- ✅ Media upload (images, audio)
- ✅ Set credit pricing for exams
- ✅ Mark exams as demo/placement
- ✅ Exam preview
- ✅ Publish/Unpublish exams
- ✅ Admin dashboard

---

## ✅ PHASE 3 COMPLETION CHECKLIST

- [x] Credit packages configuration
- [x] Stripe payment service
- [x] Credit controller (purchase, balance, transactions)
- [x] Webhook controller (handle Stripe events)
- [x] Payment order management
- [x] Transaction tracking
- [x] Refund handling
- [x] Frontend credit purchase page
- [x] Frontend success page
- [x] Frontend transaction history
- [x] Credit display in navigation
- [x] Routes configuration
- [x] Documentation

**Status: PHASE 3 COMPLETE ✅**

Ready for Phase 4: Exam Management System!
