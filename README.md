# SLE Marketplace V3

A decentralized marketplace built with Next.js, featuring mobile-first design and IPFS-based data storage.

## 🚀 Features

- **Decentralized Storage**: User data encrypted and stored on Pinata IPFS
- **Mobile-First Design**: Optimized for mobile devices with responsive UI
- **Profile Management**: Complete user profile system with image uploads
- **Trust & Privacy**: Users maintain complete ownership of their data
- **Web3 Integration**: Wallet connection and blockchain integration

## 🏗️ Architecture

- **Frontend**: Next.js 14 with React
- **Storage**: Pinata IPFS for decentralized file storage
- **Database**: Supabase for metadata references
- **Authentication**: Web3 wallet integration
- **UI**: Tailwind CSS with custom components

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Supabase account
- Pinata account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_PUBLISHED_KEY=your_supabase_key
   PINATA_JWT=your_pinata_jwt
   PINATA_GATEWAY_KEY=your_pinata_gateway_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📱 Mobile Optimization

The application is designed mobile-first with:
- Touch-friendly file uploads
- Responsive image displays
- Optimized text and spacing
- Efficient use of screen real estate

## 🔒 Privacy & Security

- **Encrypted Storage**: All user data is encrypted before storage
- **Decentralized**: Data stored on IPFS networks, not centralized servers
- **User Ownership**: Users maintain complete control over their data
- **No Access**: Platform has no access to user's personal information

## 📚 Documentation

- **Changelog**: See `components/CHANGELOGs/` for detailed version history
- **Latest Version**: v3.0.6 - Mobile-First Profile Management

## 🚀 Deployment

The easiest way to deploy is using [Vercel](https://vercel.com/new):

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 📄 License

This project is licensed under the MIT License.