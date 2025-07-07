import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { User, Store, Mail, Phone, MapPin, Clock, Edit, Camera, LogOut } from "lucide-react";
import { apiService, MerchantProfile as MerchantProfileType } from '@/services/api';

interface MerchantProfileProps {
  isOpen: boolean;
  onClose: () => void;
  merchantId: string;
}

const MerchantProfile = ({ isOpen, onClose, merchantId }: MerchantProfileProps) => {
  const { toast } = useToast();
  const { logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [merchantData, setMerchantData] = useState<MerchantProfileType | null>(null);
  const [editData, setEditData] = useState<MerchantProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  // Load merchant profile from API
  useEffect(() => {
    const loadMerchantProfile = async () => {
      if (!isOpen) return;
      
      try {
        setLoading(true);
        const profileData = await apiService.getMerchantProfile();
        setMerchantData(profileData);
        setEditData(profileData);
      } catch (error) {
        console.error('Error loading merchant profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadMerchantProfile();
  }, [isOpen, toast]);

  const handleSave = async () => {
    if (!editData) return;

    try {
      const updatedProfile = await apiService.updateMerchantProfile(editData);
      setMerchantData(updatedProfile);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = (type: 'profile' | 'store', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editData) {
      const previewUrl = URL.createObjectURL(file);
      setEditData(prev => prev ? ({
        ...prev,
        [type === 'profile' ? 'profile_image' : 'store_image']: previewUrl
      }) : null);
    }
  };

  const handleSignOut = () => {
    logout();
    onClose();
  };

  if (loading || !merchantData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading profile...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              <Button
                variant={isEditing ? "default" : "outline"}
                size="sm"
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </div>
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
                      src={isEditing ? (editData?.profile_image || merchantData.profile_image) : merchantData.profile_image}
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
                      <span>{merchantData.store_name}</span>
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
                      <div className="text-2xl font-bold text-blue-600">{merchantData.total_products}</div>
                      <div className="text-sm text-gray-600">Products</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{merchantData.total_orders}</div>
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
                  {isEditing && editData ? (
                    <Input
                      id="storeName"
                      value={editData.store_name}
                      onChange={(e) => setEditData(prev => prev ? ({ ...prev, store_name: e.target.value }) : null)}
                    />
                  ) : (
                    <p className="text-gray-900">{merchantData.store_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operatingHours">Operating Hours</Label>
                  {isEditing && editData ? (
                    <Input
                      id="operatingHours"
                      value={editData.operating_hours}
                      onChange={(e) => setEditData(prev => prev ? ({ ...prev, operating_hours: e.target.value }) : null)}
                    />
                  ) : (
                    <p className="text-gray-900 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {merchantData.operating_hours}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeAddress">Store Address</Label>
                {isEditing && editData ? (
                  <Textarea
                    id="storeAddress"
                    value={editData.store_address}
                    onChange={(e) => setEditData(prev => prev ? ({ ...prev, store_address: e.target.value }) : null)}
                  />
                ) : (
                  <p className="text-gray-900 flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1" />
                    {merchantData.store_address}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeDescription">Store Description</Label>
                {isEditing && editData ? (
                  <Textarea
                    id="storeDescription"
                    value={editData.store_description}
                    onChange={(e) => setEditData(prev => prev ? ({ ...prev, store_description: e.target.value }) : null)}
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-900">{merchantData.store_description}</p>
                )}
              </div>

              {/* Store Image */}
              <div className="space-y-2">
                <Label>Store Image</Label>
                <div className="relative">
                  <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={isEditing ? (editData?.store_image || merchantData.store_image) : merchantData.store_image}
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
                  {isEditing && editData ? (
                    <Input
                      id="name"
                      value={editData.name}
                      onChange={(e) => setEditData(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                    />
                  ) : (
                    <p className="text-gray-900">{merchantData.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing && editData ? (
                    <Input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData(prev => prev ? ({ ...prev, email: e.target.value }) : null)}
                    />
                  ) : (
                    <p className="text-gray-900">{merchantData.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing && editData ? (
                    <Input
                      id="phone"
                      value={editData.phone}
                      onChange={(e) => setEditData(prev => prev ? ({ ...prev, phone: e.target.value }) : null)}
                    />
                  ) : (
                    <p className="text-gray-900">{merchantData.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <p className="text-gray-900">{merchantData.joined_date}</p>
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
