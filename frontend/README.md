# LIMONCG Frontend

React + TypeScript frontend for the LIMONCG English Exam Platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   │   ├── common/      # Common components (buttons, inputs, etc.)
│   │   ├── layouts/     # Layout components
│   │   └── exam/        # Exam-specific components
│   ├── pages/           # Page components
│   │   ├── public/      # Public pages (home, about)
│   │   ├── auth/        # Auth pages (login, register)
│   │   ├── student/     # Student portal pages
│   │   └── admin/       # Admin portal pages
│   ├── hooks/           # Custom React hooks
│   ├── store/           # Redux store
│   │   └── slices/      # Redux slices
│   ├── services/        # API service functions
│   ├── types/           # TypeScript types and interfaces
│   ├── utils/           # Utility functions
│   ├── theme/           # MUI theme configuration
│   ├── config/          # App configuration
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html           # HTML template
├── package.json
├── tsconfig.json
└── vite.config.ts       # Vite configuration
```

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Material-UI (MUI)** - Component library
- **Redux Toolkit** - State management
- **React Router v6** - Routing
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **Recharts** - Charts and visualization
- **React Hot Toast** - Toast notifications

## 📝 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Type check
npm run type-check
```

## 🎨 UI Components

The app uses Material-UI (MUI) for UI components with a custom theme. See `src/theme/index.ts` for theme configuration.

### Common Components
- Buttons
- Forms
- Cards
- Modals
- Alerts
- Loading spinners

### Layout Components
- **PublicLayout**: For public pages (home, about)
- **AuthLayout**: For authentication pages (login, register)
- **StudentLayout**: For student portal with sidebar navigation
- **AdminLayout**: For admin portal (to be created)

## 🔐 Authentication

Authentication is handled using JWT tokens stored in localStorage. The app includes:

- Login/Register pages
- Protected routes
- Automatic token refresh
- Logout functionality

See `src/store/slices/authSlice.ts` for auth state management.

## 🌐 API Integration

API calls are made using Axios with interceptors for:

- Adding auth tokens to requests
- Automatic token refresh on 401 errors
- Error handling

See `src/utils/axios.ts` for axios configuration.

## 📱 Responsive Design

The app is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🧪 Testing

```bash
# Run tests (to be set up)
npm test
```

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

This will create an optimized production build in the `build/` directory.

### Environment Variables

Make sure to set these environment variables in production:

- `VITE_API_URL` - Backend API URL
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe public key (if using payments)

## 📚 Key Features

### For Students:
- Browse available exams
- Take exams with timer
- View detailed results
- Track progress
- Manage credits
- Personalized learning paths

### For Teachers/Admins:
- Create and manage exams
- Create questions with rich content
- View student performance
- Manage users and credits

## 🔧 Configuration

### Path Aliases

The project uses path aliases for cleaner imports:

```typescript
import Button from '@components/common/Button';
import { useAuth } from '@hooks/useAuth';
import { User } from '@types/index';
```

See `tsconfig.json` and `vite.config.ts` for configuration.

### Theme Customization

Customize the theme in `src/theme/index.ts`:

```typescript
export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    // ... more config
  },
});
```

## 🐛 Troubleshooting

### Port already in use
Change the port in `vite.config.ts`:

```typescript
server: {
  port: 3001, // Change to your desired port
}
```

### Type errors
Run type check to find issues:

```bash
npm run type-check
```

## 📄 License

[Your license here]
