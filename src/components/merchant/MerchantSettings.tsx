import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Store, Clock, MapPin, Phone, Mail, Save, Bell, Shield } from "lucide-react";
import { apiService, Merchant } from '@/services/api';

interface MerchantSettingsProps {
  merchantId: string;
  isAcceptingOrders: boolean;
  onToggleOrders: (accepting: boolean) => void;
}

const MerchantSettings = ({ merchantId, isAcceptingOrders, onToggleOrders }: MerchantSettingsProps) => {
  const { toast } = useToast();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    business_type: '',
    email: '',
    phone: '',
    address: '',
    latitude: 0,
    longitude: 0,
    subscription_plan: 'basic',
    shop_status: {
      is_open: true,
      accepting_orders: true,
      reason: ''
    }
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    email_orders: true,
    email_offers: true,
    push_orders: true,
    push_promotions: false,
    sms_important: true
  });

  // Operating hours
  const [operatingHours, setOperatingHours] = useState({
    monday: { open: '09:00', close: '21:00', closed: false },
    tuesday: { open: '09:00', close: '21:00', closed: false },
    wednesday: { open: '09:00', close: '21:00', closed: false },
    thursday: { open: '09:00', close: '21:00', closed: false },
    friday: { open: '09:00', close: '21:00', closed: false },
    saturday: { open: '09:00', close: '22:00', closed: false },
    sunday: { open: '10:00', close: '20:00', closed: false }
  });

  useEffect(() => {
    loadMerchantProfile();
  }, []);

  const loadMerchantProfile = async () => {
    try {
      setLoading(true);
      const merchantData = await apiService.getMerchantProfile();
      setMerchant(merchantData);
      setFormData({
        business_name: merchantData.business_name,
        business_type: merchantData.business_type,
        email: merchantData.email,
        phone: merchantData.phone || '',
        address: merchantData.address,
        latitude: merchantData.latitude || 0,
        longitude: merchantData.longitude || 0,
        subscription_plan: merchantData.subscription_plan,
        shop_status: merchantData.shop_status
      });
    } catch (error: any) {
      console.error('Error loading merchant profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load merchant profile.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const updatedMerchant = await apiService.updateMerchantProfile(formData);
      setMerchant(updatedMerchant);
      
      toast({
        title: "Profile Updated",
        description: "Your merchant profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleShopStatus = async (isOpen: boolean) => {
    try {
      const updatedData = {
        ...formData,
        shop_status: {
          ...formData.shop_status,
          is_open: isOpen
        }
      };
      
      await apiService.updateMerchantProfile(updatedData);
      setFormData(updatedData);
      
      toast({
        title: isOpen ? "Shop Opened" : "Shop Closed",
        description: `Your shop is now ${isOpen ? 'open' : 'closed'} for customers.`,
      });
    } catch (error: any) {
      console.error('Error updating shop status:', error);
      toast({
        title: "Error",
        description: "Failed to update shop status.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Shop Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Shop Status
          </CardTitle>
          <CardDescription>
            Control your shop availability and order acceptance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium">Shop Open/Closed</h3>
              <p className="text-sm text-gray-600">
                {formData.shop_status.is_open ? 'Customers can see and order from your shop' : 'Shop is hidden from customers'}
              </p>
            </div>
            <Switch
              checked={formData.shop_status.is_open}
              onCheckedChange={handleToggleShopStatus}
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium">Accept New Orders</h3>
              <p className="text-sm text-gray-600">
                {isAcceptingOrders ? 'New orders will be received' : 'New orders are paused'}
              </p>
            </div>
            <Switch
              checked={isAcceptingOrders}
              onCheckedChange={onToggleOrders}
            />
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Business Information
          </CardTitle>
          <CardDescription>
            Update your business details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name</Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="business_type">Business Type</Label>
              <Select 
                value={formData.business_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, business_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grocery">Grocery Store</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="bakery">Bakery</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Business Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="pl-10"
                rows={3}
              />
            </div>
          </div>

          <Button onClick={handleSaveProfile} disabled={saving} className="w-full md:w-auto">
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </div>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Operating Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Operating Hours
          </CardTitle>
          <CardDescription>
            Set your shop opening and closing times for each day
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(operatingHours).map(([day, hours]) => (
            <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="w-20 font-medium capitalize">{day}</div>
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={!hours.closed}
                  onCheckedChange={(checked) => 
                    setOperatingHours(prev => ({
                      ...prev,
                      [day]: { ...prev[day as keyof typeof prev], closed: !checked }
                    }))
                  }
                />
                <span className="text-sm text-gray-600">
                  {hours.closed ? 'Closed' : 'Open'}
                </span>
              </div>

              {!hours.closed && (
                <>
                  <Input
                    type="time"
                    value={hours.open}
                    onChange={(e) => 
                      setOperatingHours(prev => ({
                        ...prev,
                        [day]: { ...prev[day as keyof typeof prev], open: e.target.value }
                      }))
                    }
                    className="w-32"
                  />
                  <span className="text-gray-400">to</span>
                  <Input
                    type="time"
                    value={hours.close}
                    onChange={(e) => 
                      setOperatingHours(prev => ({
                        ...prev,
                        [day]: { ...prev[day as keyof typeof prev], close: e.target.value }
                      }))
                    }
                    className="w-32"
                  />
                </>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'email_orders', label: 'Email for New Orders', description: 'Get email notifications for new orders' },
            { key: 'email_offers', label: 'Email for Offer Updates', description: 'Receive emails about offer performance' },
            { key: 'push_orders', label: 'Push Notifications for Orders', description: 'Real-time notifications for orders' },
            { key: 'push_promotions', label: 'Push for Promotions', description: 'Marketing and promotional notifications' },
            { key: 'sms_important', label: 'SMS for Important Updates', description: 'Critical updates via SMS' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h3 className="font-medium">{item.label}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <Switch
                checked={notifications[item.key as keyof typeof notifications]}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, [item.key]: checked }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Account & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Account & Security
          </CardTitle>
          <CardDescription>
            Manage your account security and subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Subscription Plan</h3>
              <p className="text-sm text-gray-600 mb-3">
                Current plan: <span className="font-medium capitalize">{formData.subscription_plan}</span>
              </p>
              <Button variant="outline" size="sm">
                Upgrade Plan
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Account Security</h3>
              <p className="text-sm text-gray-600 mb-3">
                Last login: {merchant?.created_at ? new Date(merchant.created_at).toLocaleDateString() : 'Unknown'}
              </p>
              <Button variant="outline" size="sm">
                Change Password
              </Button>
            </div>
          </div>

          <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
            <h3 className="font-medium text-red-900 mb-2">Danger Zone</h3>
            <p className="text-sm text-red-700 mb-3">
              These actions cannot be undone. Please proceed with caution.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                Deactivate Account
              </Button>
              <Button variant="destructive" size="sm">
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MerchantSettings;