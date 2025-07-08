import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Clock, Package, CheckCircle, XCircle, Truck, Search, Phone, MapPin, Calendar } from "lucide-react";
import { apiService, Order } from '@/services/api';

interface OrderManagementProps {
  merchantId: string;
}

const OrderManagement = ({ merchantId }: OrderManagementProps) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Load orders from API
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const ordersData = await apiService.getOrders();
        setOrders(ordersData);
        setFilteredOrders(ordersData);
      } catch (error: any) {
        console.error('Error loading orders:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to load orders. Please try again.",
          variant: "destructive"
        });
        setOrders([]);
        setFilteredOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [toast]);

  // Filter orders
  useEffect(() => {
    let filtered = orders;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_phone.includes(searchQuery)
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.order_time).getTime() - new Date(a.order_time).getTime());

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchQuery]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const updatedOrder = await apiService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(order => 
        order.order_id === orderId ? updatedOrder : order
      ));
      
      toast({
        title: "Status Updated",
        description: `Order status updated to ${newStatus}.`,
      });
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update order status.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      accepted: { color: "bg-blue-100 text-blue-800", icon: Package },
      preparing: { color: "bg-orange-100 text-orange-800", icon: Package },
      ready: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      delivered: { color: "bg-green-600 text-white", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-800", icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getOrderPriorityColor = (orderTime: string) => {
    const orderDate = new Date(orderTime);
    const now = new Date();
    const hoursDiff = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 2) return 'border-l-red-500'; // Urgent
    if (hoursDiff > 1) return 'border-l-yellow-500'; // Attention needed
    return 'border-l-green-500'; // Fresh order
  };

  const getStatusOptions = (currentStatus: string) => {
    const statusFlow = {
      pending: ['accepted', 'cancelled'],
      accepted: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['delivered'],
      delivered: [],
      cancelled: []
    };
    
    return statusFlow[currentStatus as keyof typeof statusFlow] || [];
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Management</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search orders by ID, customer name, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'all' 
                  ? "Try adjusting your search or filters"
                  : "New orders will appear here"
                }
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <Card 
                key={order.order_id} 
                className={`border-l-4 ${getOrderPriorityColor(order.order_time)} hover:shadow-md transition-shadow cursor-pointer`}
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">Order #{order.order_id.slice(-8)}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {order.customer_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.order_time).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">₹{order.total_amount}</p>
                      <p className="text-sm text-gray-500">{order.items.length} item(s)</p>
                    </div>
                  </div>
                  
                  {/* Quick Order Items Preview */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {item.product_name} x {item.quantity}
                        </Badge>
                      ))}
                      {order.items.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{order.items.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {order.customer_phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate max-w-xs">{order.customer_address}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {new Date(order.order_time).toLocaleDateString()} at{' '}
                      {new Date(order.order_time).toLocaleTimeString()}
                    </span>
                    
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <div className="flex gap-2">
                        {getStatusOptions(order.status).map((status) => (
                          <Button
                            key={status}
                            size="sm"
                            variant={status === 'cancelled' ? 'destructive' : 'default'}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(order.order_id, status);
                            }}
                            className="text-xs"
                          >
                            {status === 'accepted' && 'Accept'}
                            {status === 'preparing' && 'Start Preparing'}
                            {status === 'ready' && 'Mark Ready'}
                            {status === 'delivered' && 'Mark Delivered'}
                            {status === 'cancelled' && 'Cancel'}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Order Details Dialog */}
        {selectedOrder && (
          <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Order #{selectedOrder.order_id.slice(-8)}
                  {getStatusBadge(selectedOrder.status)}
                </DialogTitle>
                <DialogDescription>
                  Order placed on {new Date(selectedOrder.order_time).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Customer Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{selectedOrder.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{selectedOrder.customer_phone}</p>
                    </div>
                    <div className="col-span-full">
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">{selectedOrder.customer_address}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{item.price * item.quantity}</p>
                          <p className="text-sm text-gray-600">₹{item.price} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Amount</span>
                      <span className="text-2xl font-bold">₹{selectedOrder.total_amount}</span>
                    </div>
                  </div>
                </div>

                {/* Status Update Actions */}
                {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Update Order Status</h3>
                    <div className="flex gap-2 flex-wrap">
                      {getStatusOptions(selectedOrder.status).map((status) => (
                        <Button
                          key={status}
                          variant={status === 'cancelled' ? 'destructive' : 'default'}
                          onClick={() => {
                            handleStatusUpdate(selectedOrder.order_id, status);
                            setSelectedOrder(null);
                          }}
                        >
                          {status === 'accepted' && 'Accept Order'}
                          {status === 'preparing' && 'Start Preparing'}
                          {status === 'ready' && 'Mark as Ready'}
                          {status === 'delivered' && 'Mark as Delivered'}
                          {status === 'cancelled' && 'Cancel Order'}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Estimated Delivery */}
                {selectedOrder.estimated_delivery && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Estimated Delivery</h3>
                    <p className="text-green-700">
                      {new Date(selectedOrder.estimated_delivery).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderManagement;