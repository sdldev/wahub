# WhatsApp Gateway Dashboard

Modern, responsive dashboard for managing WhatsApp Gateway sessions and messages.

## Features

- 🔐 **Authentication** - Login and registration with JWT
- 📱 **Session Management** - Manage multiple WhatsApp sessions
- 💬 **Message Composer** - Send text, image, and document messages
- 📊 **Dashboard Overview** - Real-time statistics and monitoring
- 🎨 **Modern UI** - Built with Shadcn/UI and Tailwind CSS
- 🚀 **Fast** - Powered by Vite and React 18

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Shadcn/UI
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM v6
- **State Management**: Zustand (ready to use)
- **Data Fetching**: TanStack Query (ready to use)
- **Forms**: React Hook Form + Zod (ready to use)
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Backend API running on `http://localhost:5001`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API URL
```

3. Start development server:
```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure

```
dashboard/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn UI components
│   │   └── layout/          # Layout components (Sidebar, TopNav)
│   ├── pages/
│   │   ├── auth/            # Authentication pages
│   │   └── dashboard/       # Dashboard pages
│   ├── services/            # API service layer
│   ├── lib/                 # Utilities
│   ├── App.tsx              # Main app with routing
│   └── main.tsx             # Entry point
├── public/                  # Static assets
└── components.json          # Shadcn config
```

## Available Pages

- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Main dashboard overview
- `/dashboard/sessions` - Session management
- `/dashboard/messages` - Message composer
- `/dashboard/analytics` - Analytics (coming soon)
- `/dashboard/users` - User management (coming soon)
- `/dashboard/settings` - Settings (coming soon)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5001` |
| `VITE_WS_URL` | WebSocket URL | `ws://localhost:5001` |

## Development

### Adding New UI Components

```bash
# Example: Add a new Shadcn component
npx shadcn@latest add dialog
```

### Code Style

The project uses ESLint and Prettier for code formatting. Run:

```bash
npm run lint        # Check for linting errors
npm run format      # Format code
```

## API Integration

The dashboard connects to the WhatsApp Gateway backend API. API services are located in `src/services/`:

- `auth.service.ts` - Authentication
- `session.service.ts` - Session management
- `message.service.ts` - Message operations

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

ISC
