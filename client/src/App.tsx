import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { useEffect } from "react";
import "@/lib/overlay-cleanup"; // Initialize cleanup listeners
import { cleanupStuckOverlays } from "@/lib/overlay-cleanup";

import Home from "@/pages/Home";
import AuthPage from "@/pages/Auth";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import StorePage from "@/pages/Store";
import StoreProduct from "@/pages/StoreProduct";
import PlantsPage from "@/pages/Plants";
import MedicinesPage from "@/pages/Medicines";
import FertilizersPage from "@/pages/Fertilizers";
import AccessoriesPage from "@/pages/Accessories";
import CartPage from "@/pages/Cart";
import WishlistPage from "@/pages/Wishlist";
import MyOrdersPage from "@/pages/MyOrders";
import OrderConfirmationPage from "@/pages/OrderConfirmation";
import DiseaseDetection from "@/pages/DiseaseDetection";
import GardenersPage from "@/pages/Gardeners";
import GardenerProfile from "@/pages/GardenerProfile";
import GardenerDashboard from "@/pages/GardenerDashboard";
import GardenerBookings from "@/pages/GardenerBookings";
import GardenerCompleted from "@/pages/GardenerCompleted";
import GardenerCommunity from "@/pages/GardenerCommunity";
import GardenerMessages from "@/pages/GardenerMessages";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminUsers from "@/pages/AdminUsers";
import AdminGardeners from "@/pages/AdminGardeners";
import AdminPlants from "@/pages/AdminPlants";
import AdminArticles from "@/pages/AdminArticles";
import AdminSettings from "@/pages/AdminSettings";
import AdminOrders from "@/pages/AdminOrders";
import AdminBookings from "@/pages/AdminBookings";
import { AdminRoute } from "@/components/admin/AdminRoute";
import MyBookings from "@/pages/MyBookings";
import CheckoutPage from "@/pages/Checkout";
import UserProfile from "@/pages/UserProfile";
import DiseaseHistory from "@/pages/DiseaseHistory";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/store" component={StorePage} />
      <Route path="/store/product/:type/:id" component={StoreProduct} />
      <Route path="/plants" component={PlantsPage} />
      <Route path="/medicines" component={MedicinesPage} />
      <Route path="/fertilizers" component={FertilizersPage} />
      <Route path="/accessories" component={AccessoriesPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/wishlist" component={WishlistPage} />
      <Route path="/orders" component={MyOrdersPage} />
      <Route path="/orders/confirmation/:id" component={OrderConfirmationPage} />
      <Route path="/disease" component={DiseaseDetection} />
      <Route path="/gardeners" component={GardenersPage} />
      <Route path="/gardener/profile" component={GardenerProfile} />
      <Route path="/gardener/dashboard" component={GardenerDashboard} />
      <Route path="/gardener/bookings" component={GardenerBookings} />
      <Route path="/gardener/completed" component={GardenerCompleted} />
      <Route path="/community" component={GardenerCommunity} />
      <Route path="/gardener/messages" component={GardenerMessages} />
      <Route path="/admin/dashboard">
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      </Route>
      <Route path="/admin/users">
        <AdminRoute>
          <AdminUsers />
        </AdminRoute>
      </Route>
      <Route path="/admin/gardeners">
        <AdminRoute>
          <AdminGardeners />
        </AdminRoute>
      </Route>
      <Route path="/admin/plants">
        <AdminRoute>
          <AdminPlants />
        </AdminRoute>
      </Route>
      <Route path="/admin/articles">
        <AdminRoute>
          <AdminArticles />
        </AdminRoute>
      </Route>
      <Route path="/admin/orders">
        <AdminRoute>
          <AdminOrders />
        </AdminRoute>
      </Route>
      <Route path="/admin/bookings">
        <AdminRoute>
          <AdminBookings />
        </AdminRoute>
      </Route>
      <Route path="/admin/settings">
        <AdminRoute>
          <AdminSettings />
        </AdminRoute>
      </Route>
      <Route path="/my-bookings" component={MyBookings} />
      <Route path="/profile" component={UserProfile} />
      <Route path="/disease-history" component={DiseaseHistory} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:id" component={BlogPost} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isGardenerRoute = location === "/gardener" || location.startsWith("/gardener/");
  const isAdminRoute = location.startsWith("/admin");

  useEffect(() => {
    // Cleanup stuck overlays on route change
    cleanupStuckOverlays();
  }, [location]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background font-sans antialiased text-foreground flex flex-col">
        {!isGardenerRoute && !isAdminRoute && <Navbar />}
        <main className="flex-grow">
          <Router />
        </main>
        {!isGardenerRoute && !isAdminRoute && <Footer />}
        {!isGardenerRoute && !isAdminRoute && <BackToTop />}
        {!isGardenerRoute && !isAdminRoute && <ChatbotWidget />}
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
