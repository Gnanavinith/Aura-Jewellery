# Aura Jewellery Client

This is the frontend application for the Aura Jewellery management system.

## Tech Stack
- React 18
- Vite
- Tailwind CSS
- Axios
- React Router DOM
- React Hot Toast

## Environment Variables

Create a `.env` file in the Client directory with the following:

```env
VITE_API_BASE_URL=https://aura-jewellery.onrender.com
```

For local development, you can use:
```env
VITE_API_BASE_URL=http://localhost:5000
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your API base URL

3. Start development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint