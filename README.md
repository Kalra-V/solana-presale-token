# Solana Token Presale Platform

A full-stack token presale platform built on Solana with real-time updates and admin dashboard.

## Architecture

- **Smart Contract**: Anchor program on Solana (Rust)
- **REST API Backend Server**: Express.js server for REST APIs
- **Listener Server**: Anchor Events Listener server with Socket.io for real-time events and writing events to DB
- **Frontend**: Next.js 14 with Solana wallet integration
- **Database**: AWS DynamoDB for event storage

## Features

### User Features
- Connect Solana wallet (Phantom, Solflare)
- Deposit SOL to presale
- View deposit stats and estimated tokens
- Claim tokens when distribution is enabled
- View transaction history
- Real-time activity feed

### Admin Features
- View presale statistics
- Enable token distribution
- View all participants
- Bulk distribute tokens

## Setup

### Prerequisites
- Node.js 18+
- Yarn
- Solana CLI
- Anchor CLI
- AWS account with DynamoDB access

### Backend Setup

1. Install dependencies:
```bash
cd backend
yarn install
```

2. Create `.env` file:
```bash
PORT=3001
FRONTEND_URL=http://localhost:3000
RPC_URL=https://api.devnet.solana.com
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
SOLANA_KEYPAIR_PATH=~/.config/solana/id.json
```

3. Start the backend server:
```bash
yarn dev
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
yarn install
```

2. Create `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_PROGRAM_ID=HnQPtPdUZnYQpqX14QiP1CFY9x49hUyDCaaXUjRLH1JJ
NEXT_PUBLIC_MINT_ADDRESS=9PW5vownEEBguqy1WEcCH55vzyLb18428RdFagq7mLfe
NEXT_PUBLIC_ADMIN_WALLET=FSLqVntn9GbWGvd1WBvWS3aKQY8U8nvmbbBNffRDXnHD
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
```

3. Start the frontend:
```bash
yarn dev
```

### Event Listener Setup

The event listener (`app/listener.ts`) listens to on-chain events and stores them in DynamoDB. It also emits Socket.io events for real-time updates.

To run the listener:
```bash
# Make sure the backend server is running first
tsx app/listener.ts
```

## Project Structure

```
solana-presale-token/
├── app/                    # Backend utilities
│   ├── listener.ts        # Event listener
│   ├── client.ts          # Solana client
│   ├── eventStore.ts      # DynamoDB event storage
│   └── db.ts             # DynamoDB client
├── backend/               # Express.js server
│   ├── server.ts         # Main server
│   ├── routes/           # API routes
│   └── services/         # Business logic
├── frontend/              # Next.js app
│   ├── app/              # Pages
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks
│   └── lib/              # Utilities
└── programs/             # Solana program (Rust)
```

## API Endpoints

- `GET /api/user-stats/:wallet` - Get user statistics
- `GET /api/presale-stats` - Get presale statistics
- `GET /api/activities` - Get recent activities
- `GET /api/participants` - Get all participants (admin)

## Socket.io Events

- `deposit` - New deposit event
- `distribute` - Token distribution event
- `enable_distribution` - Distribution enabled event
- `initialize_user` - User initialization event

## Development

### Running in Development

1. Start backend: `cd backend && yarn dev`
2. Start frontend: `cd frontend && yarn dev`
3. Run listener: `tsx app/listener.ts`

### Building for Production

Backend:
```bash
cd backend
yarn build
yarn start
```

Frontend:
```bash
cd frontend
yarn build
yarn start
```