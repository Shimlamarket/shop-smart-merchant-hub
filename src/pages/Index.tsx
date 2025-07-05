
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductManagement from "@/components/merchant/ProductManagement";
import OrderManagement from "@/components/merchant/OrderManagement";
import MerchantSettings from "@/components/merchant/MerchantSettings";
import { useToast } from "@/hooks/use-toast";
import { Package, ShoppingCart, Settings, TrendingUp } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const [merchantId] = useState("merchant-123"); // In real app, this would come from auth

  const stats = [
    { title: "Total Products", value: "142", icon: Package, color: "text-blue-600" },
    { title: "Pending Orders", value: "8", icon: ShoppingCart, color: "text-orange-600" },
    { title: "Active Offers", value: "3", icon: TrendingUp, color: "text-green-600" },
    { title: "Revenue Today", value: "₹2,450", icon: TrendingUp, color: "text-purple-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Merchant Dashboard</h1>
          <p className="text-gray-600">Manage your products, orders, and business settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductManagement merchantId={merchantId} />
          </TabsContent>

          <TabsContent value="orders">
            <OrderManagement merchantId={merchantId} />
          </TabsContent>

          <TabsContent value="settings">
            <MerchantSettings merchantId={merchantId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
