# Delivery App - Frontend

A modern, responsive Vue 3 frontend for the Delivery API.

## Tech Stack

- **Vue 3** - Composition API with `<script setup>`
- **TypeScript** - Type safety
- **Vite** - Fast build tool & dev server
- **Pinia** - State management with persistence
- **Vue Router** - Client-side routing with guards
- **VueUse** - Composition utilities

## Features

- **Authentication** - Login, Signup, Logout with JWT cookies
- **Products** - Browse, filter by category, add to cart
- **Shopping Cart** - Add/remove items, quantity controls, checkout
- **Orders** - View order history, track status
- **Admin Panel** - Manage products (admin only)
- **Responsive Design** - Mobile-first, works on all devices
- **Dark Theme** - Modern dark UI with gradients

## Project Structure

```
src/
├── assets/
│   └── styles/
│       └── main.css       # Global styles & CSS variables
├── components/
│   ├── cart/
│   │   └── CartSidebar.vue
│   ├── layout/
│   │   └── AppHeader.vue
│   ├── products/
│   │   └── ProductCard.vue
│   └── ui/                 # Reusable UI components
│       ├── BaseButton.vue
│       ├── BaseCard.vue
│       ├── BaseInput.vue
│       ├── BaseModal.vue
│       ├── BaseSelect.vue
│       ├── EmptyState.vue
│       ├── LoadingSpinner.vue
│       └── ToastContainer.vue
├── composables/
│   ├── useLoading.ts
│   └── useToast.ts
├── router/
│   └── index.ts           # Routes & navigation guards
├── services/
│   └── api.ts             # API service layer
├── stores/
│   ├── auth.ts            # Authentication state
│   ├── cart.ts            # Shopping cart state
│   ├── orders.ts          # Orders state
│   └── products.ts        # Products state
├── types/
│   └── index.ts           # TypeScript interfaces
├── views/
│   ├── AdminView.vue
│   ├── LoginView.vue
│   ├── NotFoundView.vue
│   ├── OrdersView.vue
│   ├── ProductsView.vue
│   └── SignupView.vue
├── App.vue
└── main.ts
```

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn or npm
- Delivery API backend running on `http://localhost:8000`

### Installation

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview
```

### Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## API Integration

The app connects to the Delivery FastAPI backend:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/signup` | POST | Register user |
| `/auth/signin` | POST | Login (JWT cookies) |
| `/auth/logout` | POST | Logout |
| `/product/all` | GET | List products |
| `/product/create` | POST | Create product (admin) |
| `/product/delete/:id` | DELETE | Delete product (admin) |
| `/order/all` | GET | List user orders |
| `/order/create` | POST | Create order |

## Responsive Breakpoints

- **Desktop**: > 900px
- **Tablet**: 600px - 900px
- **Mobile**: < 600px

## Color Scheme

```css
--primary: #6366f1      /* Indigo */
--secondary: #10b981    /* Emerald */
--danger: #ef4444       /* Red */
--warning: #f59e0b      /* Amber */
--background: #0f172a   /* Slate 900 */
--surface: #1e293b      /* Slate 800 */
```

## License

MIT
