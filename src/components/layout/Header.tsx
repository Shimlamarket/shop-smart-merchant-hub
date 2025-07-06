
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bell, User, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Notification {
  id: string;
  type: 'order' | 'system' | 'stock';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface HeaderProps {
  merchantName: string;
  isAcceptingOrders: boolean;
  onToggleOrderStatus: (status: boolean) => void;
  onProfileClick: () => void;
}

const Header = ({ merchantName, isAcceptingOrders, onToggleOrderStatus, onProfileClick }: HeaderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'order',
      title: 'New Order Received',
      message: 'Order #1234 from John Doe - ₹350',
      time: '2 min ago',
      read: false
    },
    {
      id: '2',
      type: 'stock',
      title: 'Low Stock Alert',
      message: 'Coca Cola 500ml - Only 5 items left',
      time: '1 hour ago',
      read: false
    },
    {
      id: '3',
      type: 'system',
      title: 'Profile Updated',
      message: 'Your store information has been updated successfully',
      time: '3 hours ago',
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
        {/* MOBILE RESPONSIVE LAYOUT */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* First Row - Logo and Actions */}
          <div className="flex justify-between items-center">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">QuickMart Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Welcome back, {merchantName}</p>
            </div>
            
            {/* Right Side Actions - Always visible */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* Notifications */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <div className="flex justify-between items-center">
                      <DialogTitle>Notifications</DialogTitle>
                      {unreadCount > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={markAllAsRead}
                          className="text-xs"
                        >
                          Mark all as read
                        </Button>
                      )}
                    </div>
                  </DialogHeader>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-sm text-gray-900">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {notification.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        )}
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No notifications yet</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Profile Button */}
              <Button variant="outline" size="sm" onClick={onProfileClick} className="hidden xs:flex">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="outline" size="sm" onClick={onProfileClick} className="xs:hidden px-2">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Second Row - Store Status Toggle (Mobile: Full width, Desktop: Centered) */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg w-full sm:w-auto">
              <span className="text-xs sm:text-sm font-medium text-gray-700 shrink-0">
                Store Status:
              </span>
              <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1 sm:flex-initial">
                <Switch
                  checked={isAcceptingOrders}
                  onCheckedChange={onToggleOrderStatus}
                />
                <span className={`text-xs sm:text-sm font-medium truncate ${
                  isAcceptingOrders ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isAcceptingOrders ? 'Accepting Orders' : 'Currently Closed'}
                </span>
                <Badge 
                  variant={isAcceptingOrders ? "default" : "destructive"}
                  className="text-xs shrink-0"
                >
                  {isAcceptingOrders ? 'OPEN' : 'CLOSED'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
