import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';
import Header from '@/components/layout/Header';
import ProductManagement from "@/components/merchant/ProductManagement";
import OrderManagement from "@/components/merchant/OrderManagement";
import MerchantSettings from "@/components/merchant/MerchantSettings";
import MerchantProfile from "@/components/merchant/MerchantProfile";
import { Package, ShoppingCart, Settings, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";
import { apiService, DashboardAnalytics } from '@/services/api';
import { useToast } from "@/hooks/use-toast";

const DashboardContent = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [merchantId] = useState(user?.id || "merchant-123");
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Load dashboard analytics from API
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const analytics = await apiService.getDashboard();
        setDashboardData(analytics);
      } catch (error: any) {
        console.error('Error loading dashboard data:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to load dashboard data. Please try again.",
          variant: "destructive"
        });
        // Fallback to default stats if API fails
        setDashboardData({
          orders_today: 0,
          revenue_today: 0,
          active_offers: 0,
          low_stock_products: 0,
          total_products: 0,
          pending_orders: 0,
          top_products: [],
          recent_orders: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [toast]);

  const stats = [
    { 
      title: "Total Products", 
      value: dashboardData?.total_products?.toString() || "0", 
      icon: Package, 
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      title: "Pending Orders", 
      value: dashboardData?.pending_orders?.toString() || "0", 
      icon: ShoppingCart, 
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    { 
      title: "Active Offers", 
      value: dashboardData?.active_offers?.toString() || "0", 
      icon: TrendingUp, 
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    { 
      title: "Revenue Today", 
      value: dashboardData ? `₹${dashboardData.revenue_today}` : "₹0", 
      icon: DollarSign, 
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Low Stock Products",
      value: dashboardData?.low_stock_products?.toString() || "0",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Orders Today",
      value: dashboardData?.orders_today?.toString() || "0",
      icon: ShoppingCart,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    }
  ];

  if (showProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          user={user} 
          onLogout={logout} 
          onShowProfile={() => setShowProfile(true)}
          isAcceptingOrders={isAcceptingOrders}
          onToggleOrders={setIsAcceptingOrders}
        />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <MerchantProfile 
            merchantId={merchantId} 
            onBack={() => setShowProfile(false)} 
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user} 
        onLogout={logout} 
        onShowProfile={() => setShowProfile(true)}
        isAcceptingOrders={isAcceptingOrders}
        onToggleOrders={setIsAcceptingOrders}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
            <p className="text-gray-600 mt-1">Here's what's happening with your store today.</p>
          </div>
          {user?.merchantData && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Store Status</p>
              <p className={`font-semibold ${user.merchantData.is_active ? 'text-green-600' : 'text-red-600'}`}>
                {user.merchantData.is_active ? 'Open' : 'Closed'}
              </p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Recent Activity & Quick Actions */}
        {dashboardData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.recent_orders.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recent_orders.slice(0, 5).map((order) => (
                      <div key={order.order_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Order #{order.order_id.slice(-8)}</p>
                          <p className="text-sm text-gray-600">{order.customer_name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.order_time).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{order.total_amount}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent orders</p>
                )}
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Top Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                {false ? (
                  <div className="space-y-4">
                    {dashboardData.top_products.slice(0, 5).map((product, index) => (
                      <div key={product.product_id} className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">#{index + 1}</p>
                          <p className={`text-xs ${product.is_active ? 'text-green-600' : 'text-red-600'}`}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No products found</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <ProductManagement merchantId={merchantId} />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <OrderManagement merchantId={merchantId} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Performance Metrics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Revenue</span>
                        <span className="font-semibold">₹{dashboardData?.revenue_today || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Orders Today</span>
                        <span className="font-semibold">{dashboardData?.orders_today || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Products</span>
                        <span className="font-semibold">{dashboardData?.total_products || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Quick Actions</h3>
                    <div className="space-y-2">
                      <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                        Export Sales Report
                      </button>
                      <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                        Download Inventory
                      </button>
                      <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                        View Analytics
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <MerchantSettings 
              merchantId={merchantId} 
              isAcceptingOrders={isAcceptingOrders}
              onToggleOrders={setIsAcceptingOrders}
            />
          </TabsContent>
        </Tabs>
      </main>
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
