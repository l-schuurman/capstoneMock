import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { AuthProvider } from '../contexts/AuthContext';

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8">
          <Outlet />
        </main>
      </div>
      {process.env.NODE_ENV === 'development' && <TanStackRouterDevtools />}
    </AuthProvider>
  ),
});
