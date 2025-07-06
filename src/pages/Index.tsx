
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';
import Header from '@/components/layout/Header';
import ProductManagement from "@/components/merchant/ProductManagement";
import OrderManagement from "@/components/merchant/OrderManagement";
import MerchantSettings from "@/components/merchant/MerchantSettings";
import MerchantProfile from "@/components/merchant/MerchantProfile";
import { Package, ShoppingCart, Settings, TrendingUp } from "lucide-react";

const DashboardContent = () => {
  const { user, logout } = useAuth();
  const [merchantId] = useState("merchant-123");
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  const stats = [
    { title: "Total Products", value: "142", icon: Package, color: "text-blue-600" },
    { title: "Pending Orders", value: "8", icon: ShoppingCart, color: "text-orange-600" },
    { title: "Active Offers", value: "3", icon: TrendingUp, color: "text-green-600" },
    { title: "Revenue Today", value: "₹2,450", icon: TrendingUp, color: "text-purple-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header
        merchantName={user?.name || 'Merchant'}
        isAcceptingOrders={isAcceptingOrders}
        onToggleOrderStatus={setIsAcceptingOrders}
        onProfileClick={() => setShowProfile(true)}
      />
      
      <div className="container mx-auto p-3 sm:p-6">
        {/* Stats Cards - IMPROVED MOBILE */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color} shrink-0`} />
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-lg sm:text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs - IMPROVED MOBILE */}
        <Tabs defaultValue="products" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="products" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <Package className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Products</span>
              <span className="xs:hidden">Items</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Orders</span>
              <span className="xs:hidden">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Settings</span>
              <span className="xs:hidden">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-4 sm:mt-6">
            <ProductManagement merchantId={merchantId} />
          </TabsContent>

          <TabsContent value="orders" className="mt-4 sm:mt-6">
            <OrderManagement merchantId={merchantId} />
          </TabsContent>

          <TabsContent value="settings" className="mt-4 sm:mt-6">
            <MerchantSettings merchantId={merchantId} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Profile Modal */}
      <MerchantProfile
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        merchantId={merchantId}
      />
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
};

export default Index;
