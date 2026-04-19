import { useState } from 'react'
import {Routes, Route, Navigate} from 'react-router-dom'
import Home from './pages/home/Home'
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Gallery from './pages/gallery/Gallery';
import ImageDetail from './pages/imagedetail/ImageDEtail';
import Pricing from './pages/pricing/Pricing';
import { ForgotPassword, Login, Register, ResetPassword, VerifyEmail } from './pages/auth/Index';
import { Dashboard, Purchases, Saved, Settings } from './pages/dashboard';
import { ContributorApply, ContributorDashboard, MyImage, UploadImage } from './pages/contributor';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ImageProvider } from './context/ImageContext';

const PrivateRoute = ({ children }) => {
  const { isAuth, loading } = useAuth();
  if (loading) return <PageLoader />;
  return isAuth ? children : <Navigate to="/login" replace />;
};

const ContributorRoute = ({ children }) => {
  const { isContributor, loading } = useAuth();
  if (loading) return <PageLoader />;
  return isContributor ? children : <Navigate to="/contributor/apply" replace />;
};

const GuestRoute = ({ children }) => {
  const { isAuth } = useAuth();
  return isAuth ? <Navigate to="/dashboard" replace /> : children;
};

const PageLoader = () => (
  <div className="min-h-screen bg-ink flex items-center justify-center">
    <div className="w-6 h-6 border border-paper/20 border-t-paper/60 rounded-full animate-spin" />
  </div>
);

// App shell 
const AppShell = ({ children }) => (
  <div className="min-h-screen bg-ink flex flex-col">
    <Navbar/>
    <main className="flex-1">{children}</main>
    <Footer/>
  </div>
);


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <ToastProvider>
    <AuthProvider>
    <CartProvider>
      <ImageProvider>
    <Routes>
      <Route path='/' element={<AppShell><Home/></AppShell>}/>
      <Route path="/gallery" element={<AppShell><Gallery/></AppShell>} />
      <Route path="/images/:id" element={<AppShell><ImageDetail/></AppShell>} />
      <Route path="/pricing" element={<AppShell><Pricing/></AppShell>} />
      {/* Auth route */}
      <Route path="/login" element={<GuestRoute><Login/></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register/></GuestRoute>} />
      <Route path="/verify-email" element={<VerifyEmail/>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPassword/></GuestRoute>} />
      <Route path="/reset-password" element={<GuestRoute><ResetPassword/></GuestRoute>} />

      {/* Checkout results */}
      {/* <Route path="/checkout/success" element={<PrivateRoute><AppShell><CheckoutSuccess/></AppShell></PrivateRoute>} />
      <Route path="/checkout/cancel"  element={<AppShell><CheckoutCancel /></AppShell>} /> */}

      {/* User dashboard */}
      <Route path="/dashboard" element={<PrivateRoute><AppShell><Dashboard/></AppShell></PrivateRoute>} />
      <Route path="/dashboard/purchases" element={<PrivateRoute><AppShell><Purchases/></AppShell></PrivateRoute>} />
      <Route path="/dashboard/saved" element={<PrivateRoute><AppShell><Saved/></AppShell></PrivateRoute>} />
      <Route path="/dashboard/settings" element={<PrivateRoute><AppShell><Settings/></AppShell></PrivateRoute>}/>

      {/* contributor */}
      <Route path="/contributor/apply" element={<PrivateRoute><AppShell><ContributorApply/></AppShell></PrivateRoute>} />
      <Route path="/contributor/dashboard" element={<ContributorDashboard/>} />
      <Route path="/contributor/upload" element={<PrivateRoute><AppShell><UploadImage/></AppShell></PrivateRoute>} />
      <Route path="/contributor/images" element={<PrivateRoute><AppShell><MyImage/></AppShell></PrivateRoute>} />

      <Route path="*" element={<AppShell><NotFound/></AppShell>} />
    </Routes>
    </ImageProvider>
    </CartProvider>
    </AuthProvider>
    </ToastProvider>
    </>
  )
}

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <p className="font-mono text-xs text-paper/30 tracking-widest uppercase">404</p>
    <h1 className="font-serif text-5xl">Page not found.</h1>
    <a href="/" className="font-mono text-xs text-paper/50 border border-border px-5 py-2 mt-4 hover:text-paper transition-colors">
      Go home
    </a>
  </div>
)

export default App
