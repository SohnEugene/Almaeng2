# Kiosk Management Backend

FastAPI backend for managing kiosks, products, and transactions with Firebase integration.

## Features

- RESTful API for kiosk, product, and transaction management
- Firebase Firestore integration for data storage
- Payment API integration (KakaoPay placeholder)
- Admin dashboard statistics
- CORS enabled for frontend development

## Project Structure

```
backend/
├── main.py                          # FastAPI application entry point
├── requirements.txt                 # Python dependencies
├── .env.example                     # Environment variables template
├── app/
│   ├── models/
│   │   └── models.py               # Pydantic models for data validation
│   ├── routes/
│   │   ├── kiosk.py                # Kiosk management endpoints
│   │   ├── product.py              # Product management endpoints
│   │   ├── transaction.py          # Transaction management endpoints
│   │   └── admin.py                # Admin statistics endpoints
│   ├── services/
│   │   ├── firebase.py             # Firebase service integration
│   │   └── payment.py              # Payment API integration
│   └── utils/
│       └── helpers.py              # Utility functions
```

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env`:
```
FIREBASE_CREDENTIALS_PATH=/path/to/your/firebase-credentials.json
PAYMENT_API_KEY=your_api_key
PAYMENT_API_SECRET=your_api_secret
```

### 3. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file and update `FIREBASE_CREDENTIALS_PATH` in `.env`

### 4. Run the Server

```bash
# Development mode with auto-reload
uvicorn main:app --reload

# Or use the built-in runner
python main.py
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## API Endpoints

### Kiosks
- `GET /api/kiosks` - Get all kiosks
- `GET /api/kiosks/{kiosk_id}` - Get specific kiosk
- `POST /api/kiosks` - Create new kiosk
- `PUT /api/kiosks/{kiosk_id}` - Update kiosk
- `DELETE /api/kiosks/{kiosk_id}` - Delete kiosk

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{product_id}` - Get specific product
- `POST /api/products` - Create new product
- `PUT /api/products/{product_id}` - Update product
- `DELETE /api/products/{product_id}` - Delete product
- `PATCH /api/products/{product_id}/availability` - Toggle availability

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/{transaction_id}` - Get specific transaction
- `POST /api/transactions` - Create new transaction
- `POST /api/transactions/{transaction_id}/confirm` - Confirm payment
- `POST /api/transactions/{transaction_id}/cancel` - Cancel transaction
- `POST /api/transactions/{transaction_id}/refund` - Refund transaction
- `GET /api/transactions/{transaction_id}/receipt` - Get receipt

### Admin
- `GET /api/admin/stats` - Get admin statistics
- `GET /api/admin/revenue` - Get revenue report
- `GET /api/admin/products/performance` - Get product performance
- `GET /api/admin/kiosks/performance` - Get kiosk performance
- `GET /api/admin/dashboard` - Get dashboard overview

## Development

### Testing with curl

```bash
# Health check
curl http://localhost:8000/health

# Get all kiosks
curl http://localhost:8000/api/kiosks

# Create a kiosk
curl -X POST http://localhost:8000/api/kiosks \
  -H "Content-Type: application/json" \
  -d '{"name": "Main Hall Kiosk", "location": "Building A", "products": []}'
```

### Interactive API Documentation

Visit http://localhost:8000/docs to access the interactive Swagger UI where you can test all endpoints.

## Payment Integration

The payment service currently uses mock responses. To integrate with a real payment API (e.g., KakaoPay):

1. Update `app/services/payment.py`
2. Uncomment the actual API call code
3. Configure your API credentials in `.env`

## Firestore Collections

The application uses the following Firestore collections:

- `kiosks` - Kiosk information
- `products` - Product catalog
- `transactions` - Transaction records

## Notes

- The server runs on port 8000 by default
- CORS is configured for localhost development
- Firebase credentials must be properly configured
- Payment API is currently mocked for development
