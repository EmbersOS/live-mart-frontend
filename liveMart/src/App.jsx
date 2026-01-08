import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Cart from './pages/Cart'
import Login from './pages/Login'
import LoginSuccess from './pages/LoginSuccess'
import Search from './pages/Search'
import Checkout from './pages/Checkout'
import Feedback from './pages/Feedback'
import Product from './pages/product'
import Customer from './pages/dashboards/Customer'
import Retailer from './pages/dashboards/Retailer'
import RetailerCheckout from './pages/dashboards/RetailerCheckout'
import Wholesaler from './pages/dashboards/Wholesaler'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'


const Layout = () => {
  const location = useLocation()
  const hideNavbar = location.pathname === '/login'
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {!hideNavbar && <Navbar />}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

import ErrorPage from './pages/ErrorPage'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: "catalog",
        element: <Catalog />
      },
      {
        path: "product/:id",
        element: <Product />
      },
      {
        path: "search",
        element: <Search />
      },
      {
        path: "cart",
        element: (
          <ProtectedRoute allowedRoles={['consumer', 'retailer', 'wholesaler']}>
            <Cart />
          </ProtectedRoute>
        )
      },
      {
        path: "checkout",
        element: (
          <ProtectedRoute allowedRoles={['consumer', 'retailer', 'wholesaler']}>
            <Checkout />
          </ProtectedRoute>
        )
      },
      {
        path: "login",
        element: <Login />
      },
      {
        path: "login/success",
        element: <LoginSuccess />
      },
      {
        path: 'feedback',
        element: <Feedback />
      },
      {
        path: 'customer',
        element: (
          <ProtectedRoute allowedRoles={['consumer']}>
            <Customer />
          </ProtectedRoute>
        )
      },
      {
        path: 'retailer',
        element: (
          <ProtectedRoute allowedRoles={['retailer']}>
            <Retailer />
          </ProtectedRoute>
        )
      },
      {
        path: 'retailer/checkout',
        element: (
          <ProtectedRoute allowedRoles={['retailer']}>
            <RetailerCheckout />
          </ProtectedRoute>
        )
      },
      {
        path: 'wholesaler',
        element: (
          <ProtectedRoute allowedRoles={['wholesaler']}>
            <Wholesaler />
          </ProtectedRoute>
        )
      }
    ]
  }
])

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
