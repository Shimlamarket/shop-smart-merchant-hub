
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { User, Store, Mail, Phone, MapPin, Clock, Edit, Camera } from "lucide-react";

interface MerchantData {
  id: string;
  name: string;
  email: string;
  phone: string;
  storeName: string;
  storeAddress: string;
  storeDescription: string;
  operatingHours: string;
  profileImage: string;
  storeImage: string;
  joinedDate: string;
  totalProducts: number;
  totalOrders: number;
  rating: number;
}

interface MerchantProfileProps {
  isOpen: boolean;
  onClose: () => void;
  merchantId: string;
}

const MerchantProfile = ({ isOpen, onClose, merchantId }: MerchantProfileProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [merchantData, setMerchantData] = useState<MerchantData>({
    id: merchantId,
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@quickmart.com',
    phone: '+91 9876543210',
    storeName: 'QuickMart Express',
    storeAddress: '123 Main Street, Electronic City, Bangalore - 560100',
    storeDescription: 'Your neighborhood convenience store offering fresh groceries, snacks, beverages and daily essentials at competitive prices.',
    operatingHours: '7:00 AM - 11:00 PM',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    storeImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop',
    joinedDate: 'January 2023',
    totalProducts: 142,
    totalOrders: 1250,
    rating: 4.8
  });

  const [editData, setEditData] = useState(merchantData);

  const handleSave = () => {
    setMerchantData(editData);
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });
  };

  const handleImageUpload = (type: 'profile' | 'store', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setEditData(prev => ({
        ...prev,
        [type === 'profile' ? 'profileImage' : 'storeImage']: previewUrl
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle>Merchant Profile</DialogTitle>
              <DialogDescription>
                View and manage your store information
              </DialogDescription>
            </div>
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                {/* Profile Image */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                    <img 
                      src={isEditing ? editData.profileImage : merchantData.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full cursor-pointer hover:bg-blue-600">
                      <Camera className="h-3 w-3" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload('profile', e)}
                      />
                    </label>
                  )}
                </div>

                {/* Basic Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {merchantData.name}
                    </h2>
                    <Badge variant="default">Verified Merchant</Badge>
                  </div>
                  <div className="space-y-1 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      <span>{merchantData.storeName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{merchantData.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{merchantData.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{merchantData.totalProducts}</div>
                      <div className="text-sm text-gray-600">Products</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{merchantData.totalOrders}</div>
                      <div className="text-sm text-gray-600">Orders</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">★ {merchantData.rating}</div>
                      <div className="text-sm text-gray-600">Rating</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Store Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Store Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  {isEditing ? (
                    <Input
                      id="storeName"
                      value={editData.storeName}
                      onChange={(e) => setEditData(prev => ({ ...prev, storeName: e.target.value }))}
                    />
                  ) : (
                    <p className="text-gray-900">{merchantData.storeName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operatingHours">Operating Hours</Label>
                  {isEditing ? (
                    <Input
                      id="operatingHours"
                      value={editData.operatingHours}
                      onChange={(e) => setEditData(prev => ({ ...prev, operatingHours: e.target.value }))}
                    />
                  ) : (
                    <p className="text-gray-900 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {merchantData.operatingHours}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeAddress">Store Address</Label>
                {isEditing ? (
                  <Textarea
                    id="storeAddress"
                    value={editData.storeAddress}
                    onChange={(e) => setEditData(prev => ({ ...prev, storeAddress: e.target.value }))}
                  />
                ) : (
                  <p className="text-gray-900 flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1" />
                    {merchantData.storeAddress}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeDescription">Store Description</Label>
                {isEditing ? (
                  <Textarea
                    id="storeDescription"
                    value={editData.storeDescription}
                    onChange={(e) => setEditData(prev => ({ ...prev, storeDescription: e.target.value }))}
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-900">{merchantData.storeDescription}</p>
                )}
              </div>

              {/* Store Image */}
              <div className="space-y-2">
                <Label>Store Image</Label>
                <div className="relative">
                  <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={isEditing ? editData.storeImage : merchantData.storeImage}
                      alt="Store"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-lg cursor-pointer hover:bg-blue-600 text-sm">
                      <Camera className="h-4 w-4 inline mr-1" />
                      Change Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload('store', e)}
                      />
                    </label>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editData.name}
                      onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  ) : (
                    <p className="text-gray-900">{merchantData.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  ) : (
                    <p className="text-gray-900">{merchantData.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={editData.phone}
                      onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  ) : (
                    <p className="text-gray-900">{merchantData.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <p className="text-gray-900">{merchantData.joinedDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {isEditing && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => {
              setIsEditing(false);
              setEditData(merchantData);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MerchantProfile;
