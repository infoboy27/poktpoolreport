# POKT Payment Report - PoktPool

An interactive web application for generating POKT payment verification reports by querying two PostgreSQL databases and comparing requested vs sent amounts.

## Features

- **Interactive Report Generation**: Input wallet address and transaction hash to generate payment reports
- **Dual Database Queries**: Queries both Poktpooldb and Waxtrax databases concurrently
- **Real-time Comparison**: Shows side-by-side comparison of requested vs sent amounts
- **PoktPool Branding**: Complete brand integration with logo, colors, and typography
- **Authentication**: Simple credential-based authentication
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Docker Support**: Containerized deployment with Docker Compose

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn/ui components
- **Authentication**: NextAuth.js with credentials provider
- **Database**: PostgreSQL with connection pooling
- **Validation**: Zod schemas for input validation
- **Testing**: Jest + React Testing Library
- **Containerization**: Docker + Docker Compose

## Prerequisites

- Node.js 18+ 
- Docker and Docker Compose (for containerized deployment)
- Access to two PostgreSQL databases:
  - Poktpooldb (for wallet verification requests)
  - Waxtrax (for network transactions)

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd poktpoolreport
```

### 2. Environment Configuration

Create a `.env.local` file based on the template:

```bash
# Auth (simple demo login)
APP_LOGIN_EMAIL=admin@poktpool.com
APP_LOGIN_PASSWORD=change_me

# Branding behavior
BRAND_NAME=PoktPool
BRAND_PRIMARY_HEX=#1F4DD9
BRAND_SECONDARY_HEX=#0A1633
BRAND_LIGHT_HEX=#EAF0FF
BRAND_DARK_HEX=#040915
BRAND_CONVERT_MICRO_UNITS=false  # set true if DB stores microPOKT

# Postgres: Poktpooldb (DB 1)
POKTPOOLDB_HOST=<<HOST_OR_IP>>
POKTPOOLDB_PORT=5432
POKTPOOLDB_NAME=poktpooldb
POKTPOOLDB_USER=postgres_chadmin
POKTPOOLDB_PASSWORD=<<SECRET>>

# Postgres: Waxtrax (DB 2)
WAXTRAX_HOST=<<HOST_OR_IP>>
WAXTRAX_PORT=5432
WAXTRAX_NAME=waxtrax
WAXTRAX_USER=vultradmin
WAXTRAX_PASSWORD=<<SECRET>>

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3007
```

### 3. Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### 4. Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

The application will be available at `http://localhost:3006`

## Database Schema

### Poktpooldb (DB 1)
```sql
-- Table: wallet_verf_req
SELECT
  wvr.wallet_address,
  wvr.req_timestamp,
  wvr.verf_amount
FROM wallet_verf_req AS wvr
WHERE wvr.network_id = 2
  AND wvr.wallet_address = $1
ORDER BY wvr.req_timestamp DESC
LIMIT 1;
```

### Waxtrax (DB 2)
```sql
-- Table: public.network_txn
SELECT
  network_id,
  network_txn_hash,
  from_wallet_address,
  to_wallet_address,
  amount
FROM public.network_txn
WHERE network_id = 2
  AND network_txn_hash = $1
LIMIT 1;
```

## API Endpoints

### POST /api/report
Generates a payment verification report by querying both databases.

**Request Body:**
```json
{
  "wallet_address": "string",
  "network_txn_hash": "string"
}
```

**Response:**
```json
{
  "success": true,
  "poktpool": {
    "data": {
      "wallet_address": "string",
      "req_timestamp": "string",
      "verf_amount": number
    },
    "error": null,
    "latency": number
  },
  "waxtrax": {
    "data": {
      "network_id": number,
      "network_txn_hash": "string",
      "from_wallet_address": "string",
      "to_wallet_address": "string",
      "amount": number
    },
    "error": null,
    "latency": number
  },
  "summary": {
    "difference": number,
    "status": "success" | "insufficient" | "error"
  }
}
```

## Features

### Authentication
- Simple credential-based authentication
- Session management with NextAuth.js
- Protected routes for report generation

### Report Generation
- Input validation with Zod schemas
- Concurrent database queries for performance
- Real-time latency tracking
- Error handling and user feedback

### UI/UX
- PoktPool branded interface
- Responsive design for mobile and desktop
- Loading states and error handling
- Side-by-side comparison cards
- Summary banner with status indicators

### Amount Formatting
- Configurable microPOKT to POKT conversion
- 6-decimal precision formatting
- Difference calculation and status determination

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Security Features

- Parameterized SQL queries (no string interpolation)
- Environment variable validation with Zod
- No logging of sensitive information
- Input sanitization and validation
- Session-based authentication

## Deployment

### Docker Compose
The application includes a complete Docker Compose setup:

```yaml
version: '3.8'
services:
  poktpool-report:
    build: .
    ports:
      - "3006:3006"
    environment:
      - NODE_ENV=production
      - PORT=3006
    env_file:
      - .env.local
    restart: unless-stopped
```

### Environment Variables
All configuration is handled through environment variables with runtime validation. See the `.env.local` template for required variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is proprietary to PoktPool.
