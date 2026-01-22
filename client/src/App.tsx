import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import Home from "@/pages/Home";
import AuthPage from "@/pages/Auth";
import PlantsPage from "@/pages/Plants";
import CartPage from "@/pages/Cart";
import MyOrdersPage from "@/pages/MyOrders";
import OrderConfirmationPage from "@/pages/OrderConfirmation";
import DiseaseDetection from "@/pages/DiseaseDetection";
import GardenersPage from "@/pages/Gardeners";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/plants" component={PlantsPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/orders" component={MyOrdersPage} />
      <Route path="/orders/confirmation/:id" component={OrderConfirmationPage} />
      <Route path="/disease" component={DiseaseDetection} />
      <Route path="/gardeners" component={GardenersPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background font-sans antialiased text-foreground flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Router />
        </main>
        <Footer />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
