
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle, XCircle, Truck, Phone, MapPin, Package, Timer } from "lucide-react";

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'accepted' | 'declined' | 'in-delivery' | 'delivered';
  orderTime: string;
  estimatedDelivery?: string;
  // NEW: Timer fields for offer acceptance
  offerExpiry?: string;
  timeRemaining?: number;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  customization?: string;
}

interface OrderManagementProps {
  merchantId: string;
}

const OrderManagement = ({ merchantId }: OrderManagementProps) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Mock data initialization
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: 'ORD-001',
        customerName: 'Rajesh Kumar',
        customerPhone: '+91 9876543210',
        customerAddress: '123 MG Road, Sector 14, Gurgaon, Haryana - 122001',
        items: [
          { productId: '1', productName: 'Coca Cola 500ml', quantity: 2, price: 35, customization: 'Extra ice' },
          { productId: '2', productName: 'Parle-G Biscuits', quantity: 1, price: 23 }
        ],
        totalAmount: 93,
        status: 'pending',
        orderTime: '2024-01-15T14:30:00Z',
        // NEW: 2-minute timer for pending orders
        offerExpiry: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
        timeRemaining: 120
      },
      {
        id: 'ORD-002',
        customerName: 'Priya Sharma',
        customerPhone: '+91 8765432109',
        customerAddress: '456 Park Street, Block B, Noida, UP - 201301',
        items: [
          { productId: '3', productName: 'Vanilla Ice Cream', quantity: 1, price: 120 }
        ],
        totalAmount: 120,
        status: 'accepted',
        orderTime: '2024-01-15T13:15:00Z',
        estimatedDelivery: '2024-01-15T15:30:00Z'
      },
      {
        id: 'ORD-003',
        customerName: 'Amit Patel',
        customerPhone: '+91 7654321098',
        customerAddress: '789 Gandhi Nagar, Phase 2, Ahmedabad, Gujarat - 380001',
        items: [
          { productId: '1', productName: 'Coca Cola 500ml', quantity: 3, price: 35 },
          { productId: '4', productName: 'Lay\'s Chips', quantity: 2, price: 20 }
        ],
        totalAmount: 145,
        status: 'in-delivery',
        orderTime: '2024-01-15T12:00:00Z',
        estimatedDelivery: '2024-01-15T14:00:00Z'
      }
    ];
    setOrders(mockOrders);
    setFilteredOrders(mockOrders);
  }, []);

  // NEW: Timer countdown for pending orders
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.status === 'pending' && order.offerExpiry) {
            const now = new Date().getTime();
            const expiry = new Date(order.offerExpiry).getTime();
            const timeLeft = Math.max(0, Math.floor((expiry - now) / 1000));
            
            if (timeLeft === 0) {
              // Auto-reject expired orders
              toast({
                title: "Order Expired",
                description: `Order ${order.id} was automatically rejected due to timeout.`,
                variant: "destructive"
              });
              
              return { ...order, status: 'declined' as const, timeRemaining: 0 };
            }
            
            return { ...order, timeRemaining: timeLeft };
          }
          return order;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [toast]);

  // Filter orders by status
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === statusFilter));
    }
  }, [orders, statusFilter]);

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: newStatus,
            estimatedDelivery: newStatus === 'accepted' ? 
              new Date(Date.now() + 90 * 60 * 1000).toISOString() : 
              order.estimatedDelivery,
            // Clear timer when order is accepted/declined
            offerExpiry: undefined,
            timeRemaining: undefined
          }
        : order
    ));

    const statusMessages = {
      accepted: 'Order accepted successfully!',
      declined: 'Order declined.',
      'in-delivery': 'Order marked as in delivery.',
      delivered: 'Order marked as delivered.'
    };

    toast({
      title: "Order Status Updated",
      description: statusMessages[newStatus],
    });
  };

  const callCustomer = (phone: string) => {
    // In a real app, this would integrate with a calling service
    toast({
      title: "Calling Customer",
      description: `Initiating call to ${phone}`,
    });
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'declined': return <XCircle className="h-4 w-4" />;
      case 'in-delivery': return <Truck className="h-4 w-4" />;
      case 'delivered': return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'in-delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short'
    });
  };

  // NEW: Format timer display
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Order Management</h2>
          <p className="text-sm sm:text-base text-gray-600">Track and manage customer orders</p>
        </div>
        
        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg z-50">
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
            <SelectItem value="in-delivery">In Delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredOrders.map(order => (
          <OrderCard 
            key={order.id}
            order={order}
            onUpdateStatus={updateOrderStatus}
            onCallCustomer={callCustomer}
            onViewDetails={() => setSelectedOrder(order)}
            formatTimer={formatTimer}
          />
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <Package className="h-8 sm:h-12 w-8 sm:w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-sm sm:text-base text-gray-600">
              {orders.length === 0 
                ? "You don't have any orders yet." 
                : "No orders match the selected filter."
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg">Order Details - {selectedOrder.id}</DialogTitle>
              <DialogDescription className="text-sm">
                Complete order information and customer details
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 sm:space-y-6">
              {/* Timer Display for Pending Orders */}
              {selectedOrder.status === 'pending' && selectedOrder.timeRemaining !== undefined && (
                <div className="flex items-center justify-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Timer className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="font-semibold text-yellow-800">
                    Time to accept: {formatTimer(selectedOrder.timeRemaining)}
                  </span>
                </div>
              )}

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Customer Information</h4>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                    <p><strong>Phone:</strong> {selectedOrder.customerPhone}</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-gray-500 shrink-0" />
                      <span className="break-words">{selectedOrder.customerAddress}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Order Information</h4>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <p><strong>Order Time:</strong> {formatTime(selectedOrder.orderTime)}</p>
                    <p className="flex items-center gap-2"><strong>Status:</strong> 
                      <Badge className={`${getStatusColor(selectedOrder.status)} text-xs`}>
                        {selectedOrder.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </p>
                    {selectedOrder.estimatedDelivery && (
                      <p><strong>Estimated Delivery:</strong> {formatTime(selectedOrder.estimatedDelivery)}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold mb-3 text-sm">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm">{item.productName}</p>
                        <p className="text-xs text-gray-600">Quantity: {item.quantity}</p>
                        {item.customization && (
                          <p className="text-xs text-blue-600">Note: {item.customization}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-sm">₹{item.price * item.quantity}</p>
                        <p className="text-xs text-gray-600">₹{item.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="text-base sm:text-lg font-semibold">Total Amount:</span>
                  <span className="text-lg sm:text-xl font-bold text-green-600">₹{selectedOrder.totalAmount}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => callCustomer(selectedOrder.customerPhone)} className="w-full sm:w-auto">
                <Phone className="h-4 w-4 mr-2" />
                Call Customer
              </Button>
              {selectedOrder.status === 'pending' && (
                <>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'declined');
                      setSelectedOrder(null);
                    }}
                    className="w-full sm:w-auto"
                  >
                    Decline Order
                  </Button>
                  <Button 
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'accepted');
                      setSelectedOrder(null);
                    }}
                    className="w-full sm:w-auto"
                  >
                    Accept Order
                  </Button>
                </>
              )}
              {selectedOrder.status === 'accepted' && (
                <Button 
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'in-delivery');
                    setSelectedOrder(null);
                  }}
                  className="w-full sm:w-auto"
                >
                  Mark as In Delivery
                </Button>
              )}
              {selectedOrder.status === 'in-delivery' && (
                <Button 
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'delivered');
                    setSelectedOrder(null);
                  }}
                  className="w-full sm:w-auto"
                >
                  Mark as Delivered
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const OrderCard = ({ 
  order, 
  onUpdateStatus, 
  onCallCustomer, 
  onViewDetails,
  formatTimer
}: {
  order: Order;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
  onCallCustomer: (phone: string) => void;
  onViewDetails: () => void;
  formatTimer: (seconds: number) => string;
}) => {
  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'declined': return <XCircle className="h-4 w-4" />;
      case 'in-delivery': return <Truck className="h-4 w-4" />;
      case 'delivered': return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'in-delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short'
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base sm:text-lg">Order {order.id}</CardTitle>
            <CardDescription className="text-sm">{order.customerName} • {formatTime(order.orderTime)}</CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={`flex items-center gap-1 ${getStatusColor(order.status)} text-xs`}>
              {getStatusIcon(order.status)}
              {order.status.replace('-', ' ').toUpperCase()}
            </Badge>
            {/* NEW: Timer badge for pending orders */}
            {order.status === 'pending' && order.timeRemaining !== undefined && order.timeRemaining > 0 && (
              <Badge variant="outline" className="flex items-center gap-1 text-xs border-yellow-400 text-yellow-700">
                <Timer className="h-3 w-3" />
                {formatTimer(order.timeRemaining)}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Items ({order.items.length})</h4>
            <div className="space-y-1">
              {order.items.slice(0, 2).map((item, index) => (
                <p key={index} className="text-xs sm:text-sm text-gray-600">
                  {item.quantity}x {item.productName}
                </p>
              ))}
              {order.items.length > 2 && (
                <p className="text-xs text-gray-500">+{order.items.length - 2} more items</p>
              )}
            </div>
          </div>
          
          <div className="text-left sm:text-right">
            <p className="text-xl sm:text-2xl font-bold text-green-600">₹{order.totalAmount}</p>
            {order.estimatedDelivery && (
              <p className="text-xs sm:text-sm text-gray-600">
                ETA: {formatTime(order.estimatedDelivery)}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button size="sm" variant="outline" onClick={onViewDetails} className="text-xs">
            View Details
          </Button>
          <Button size="sm" variant="outline" onClick={() => onCallCustomer(order.customerPhone)} className="text-xs">
            <Phone className="h-3 w-3 mr-1" />
            Call
          </Button>
          
          {order.status === 'pending' && (
            <>
              <Button size="sm" variant="destructive" onClick={() => onUpdateStatus(order.id, 'declined')} className="text-xs">
                Decline
              </Button>
              <Button size="sm" onClick={() => onUpdateStatus(order.id, 'accepted')} className="text-xs">
                Accept
              </Button>
            </>
          )}
          
          {order.status === 'accepted' && (
            <Button size="sm" onClick={() => onUpdateStatus(order.id, 'in-delivery')} className="text-xs">
              Start Delivery
            </Button>
          )}
          
          {order.status === 'in-delivery' && (
            <Button size="sm" onClick={() => onUpdateStatus(order.id, 'delivered')} className="text-xs">
              Mark Delivered
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderManagement;
