
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Save, Settings, Percent, Gift, Bell } from "lucide-react";

interface MerchantMetadata {
  storeName: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  businessHours: {
    open: string;
    close: string;
  };
  deliveryRadius: number;
  minimumOrderAmount: number;
}

interface GlobalOffer {
  id: string;
  type: 'percentage' | 'bogo' | 'minimum_order';
  value: number;
  description: string;
  isActive: boolean;
  validUntil?: string;
}

interface MerchantSettingsProps {
  merchantId: string;
}

const MerchantSettings = ({ merchantId }: MerchantSettingsProps) => {
  const { toast } = useToast();
  const [metadata, setMetadata] = useState<MerchantMetadata>({
    storeName: 'My Store',
    description: 'Fresh groceries and daily essentials',
    address: '123 Main Street, City, State - 123456',
    phone: '+91 9876543210',
    email: 'store@example.com',
    businessHours: { open: '09:00', close: '21:00' },
    deliveryRadius: 5,
    minimumOrderAmount: 50
  });

  const [globalOffers, setGlobalOffers] = useState<GlobalOffer[]>([
    {
      id: '1',
      type: 'percentage',
      value: 10,
      description: '10% off on orders above ₹500',
      isActive: true,
      validUntil: '2024-02-15'
    },
    {
      id: '2',
      type: 'bogo',
      value: 1,
      description: 'Buy 1 Get 1 Free on selected items',
      isActive: false
    }
  ]);

  const [notifications, setNotifications] = useState({
    newOrders: true,
    lowStock: true,
    customerMessages: true,
    dailyReports: false
  });

  const [inventoryCount, setInventoryCount] = useState(142);

  const updateMetadata = () => {
    // API call would go here: PUT /merchants/:merchantId/update-merchant-metadata
    toast({
      title: "Settings Updated",
      description: "Merchant metadata has been successfully updated.",
    });
  };

  const toggleGlobalOffer = (offerId: string) => {
    setGlobalOffers(prev => prev.map(offer => 
      offer.id === offerId 
        ? { ...offer, isActive: !offer.isActive }
        : offer
    ));
    toast({
      title: "Offer Updated",
      description: "Global offer status has been changed.",
    });
  };

  const addGlobalOffer = (newOffer: Omit<GlobalOffer, 'id'>) => {
    const offer: GlobalOffer = {
      ...newOffer,
      id: Date.now().toString()
    };
    setGlobalOffers(prev => [...prev, offer]);
    toast({
      title: "Offer Created",
      description: "New global offer has been added successfully.",
    });
  };

  const removeGlobalOffer = (offerId: string) => {
    setGlobalOffers(prev => prev.filter(offer => offer.id !== offerId));
    toast({
      title: "Offer Removed",
      description: "Global offer has been deleted.",
      variant: "destructive"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Merchant Settings</h2>
        <p className="text-gray-600">Manage your store information and business settings</p>
      </div>

      {/* Low Inventory Alert */}
      {inventoryCount === 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-semibold text-orange-800">Inventory Alert</p>
                <p className="text-sm text-orange-700">
                  You have no items in your inventory. Add products to start receiving orders.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Store Information
            </CardTitle>
            <CardDescription>Update your store details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                value={metadata.storeName}
                onChange={(e) => setMetadata(prev => ({ ...prev, storeName: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={metadata.description}
                onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={metadata.address}
                onChange={(e) => setMetadata(prev => ({ ...prev, address: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={metadata.phone}
                  onChange={(e) => setMetadata(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={metadata.email}
                  onChange={(e) => setMetadata(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openTime">Opening Time</Label>
                <Input
                  id="openTime"
                  type="time"
                  value={metadata.businessHours.open}
                  onChange={(e) => setMetadata(prev => ({ 
                    ...prev, 
                    businessHours: { ...prev.businessHours, open: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closeTime">Closing Time</Label>
                <Input
                  id="closeTime"
                  type="time"
                  value={metadata.businessHours.close}
                  onChange={(e) => setMetadata(prev => ({ 
                    ...prev, 
                    businessHours: { ...prev.businessHours, close: e.target.value }
                  }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryRadius">Delivery Radius (km)</Label>
                <Input
                  id="deliveryRadius"
                  type="number"
                  value={metadata.deliveryRadius}
                  onChange={(e) => setMetadata(prev => ({ ...prev, deliveryRadius: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimumOrder">Minimum Order (₹)</Label>
                <Input
                  id="minimumOrder"
                  type="number"
                  value={metadata.minimumOrderAmount}
                  onChange={(e) => setMetadata(prev => ({ ...prev, minimumOrderAmount: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <Button onClick={updateMetadata} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Store Information
            </Button>
          </CardContent>
        </Card>

        {/* Global Offers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Global Offers
            </CardTitle>
            <CardDescription>Manage store-wide discounts and promotional offers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {globalOffers.map(offer => (
              <GlobalOfferCard
                key={offer.id}
                offer={offer}
                onToggle={() => toggleGlobalOffer(offer.id)}
                onRemove={() => removeGlobalOffer(offer.id)}
              />
            ))}
            
            <GlobalOfferForm onSubmit={addGlobalOffer} />
          </CardContent>
        </Card>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose what notifications you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor={key} className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <p className="text-sm text-gray-500">
                    {getNotificationDescription(key)}
                  </p>
                </div>
                <Switch
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, [key]: checked }))
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const GlobalOfferCard = ({ 
  offer, 
  onToggle, 
  onRemove 
}: {
  offer: GlobalOffer;
  onToggle: () => void;
  onRemove: () => void;
}) => {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={offer.isActive ? "default" : "secondary"}>
            {offer.isActive ? "Active" : "Inactive"}
          </Badge>
          <span className="font-medium">{offer.description}</span>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={offer.isActive} onCheckedChange={onToggle} />
          <Button size="sm" variant="outline" onClick={onRemove}>
            Remove
          </Button>
        </div>
      </div>
      
      {offer.validUntil && (
        <p className="text-sm text-gray-600">
          Valid until: {new Date(offer.validUntil).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

const GlobalOfferForm = ({ onSubmit }: {
  onSubmit: (offer: Omit<GlobalOffer, 'id'>) => void;
}) => {
  const [formData, setFormData] = useState({
    type: 'percentage' as GlobalOffer['type'],
    value: 0,
    description: '',
    validUntil: ''
  });

  const handleSubmit = () => {
    if (formData.description && formData.value > 0) {
      onSubmit({
        ...formData,
        isActive: true,
        validUntil: formData.validUntil || undefined
      });
      setFormData({
        type: 'percentage',
        value: 0,
        description: '',
        validUntil: ''
      });
    }
  };

  return (
    <div className="p-4 border-2 border-dashed rounded-lg space-y-3">
      <h4 className="font-semibold">Add New Offer</h4>
      
      <div className="grid grid-cols-2 gap-3">
        <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as GlobalOffer['type'] }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Percentage Discount</SelectItem>
            <SelectItem value="bogo">Buy One Get One</SelectItem>
            <SelectItem value="minimum_order">Minimum Order Discount</SelectItem>
          </SelectContent>
        </Select>
        
        <Input
          type="number"
          placeholder="Value"
          value={formData.value}
          onChange={(e) => setFormData(prev => ({ ...prev, value: parseInt(e.target.value) || 0 }))}
        />
      </div>
      
      <Input
        placeholder="Offer description"
        value={formData.description}
        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
      />
      
      <Input
        type="date"
        placeholder="Valid until (optional)"
        value={formData.validUntil}
        onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
      />
      
      <Button onClick={handleSubmit}>Add Offer</Button>
    </div>
  );
};

const getNotificationDescription = (key: string) => {
  const descriptions = {
    newOrders: "Get notified when new orders arrive",
    lowStock: "Alert when product inventory is low",
    customerMessages: "Receive customer inquiries and feedback",
    dailyReports: "Daily summary of sales and performance"
  };
  return descriptions[key as keyof typeof descriptions] || "";
};

export default MerchantSettings;
