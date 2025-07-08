import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiService, Offer, Product } from '@/services/api';
import { Calendar, Percent, DollarSign, Tag, Gift } from "lucide-react";

interface OfferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offerData: any) => void;
  offer?: Offer | null;
  productId?: string;
  shopId?: string;
  isEditing?: boolean;
}

const OfferDialog = ({ isOpen, onClose, onSubmit, offer, productId, shopId, isEditing }: OfferDialogProps) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed' | 'bogo' | 'custom',
    discount_value: 0,
    level: 'product' as 'product' | 'merchant',
    valid_from: '',
    valid_till: '',
    product_ids: [] as string[]
  });

  // Load products for product-level offers
  useEffect(() => {
    if (isOpen && !productId && !shopId) {
      loadProducts();
    }
  }, [isOpen, productId, shopId]);

  // Initialize form data when editing
  useEffect(() => {
    if (offer) {
      setFormData({
        name: offer.name,
        description: offer.description || '',
        type: offer.type,
        discount_value: offer.discount_value,
        level: offer.level,
        valid_from: offer.valid_from.split('T')[0], // Format for date input
        valid_till: offer.valid_till.split('T')[0],
        product_ids: offer.product_ids || []
      });
    } else {
      // Reset form for new offer
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);

      setFormData({
        name: '',
        description: '',
        type: 'percentage',
        discount_value: 0,
        level: productId ? 'product' : shopId ? 'merchant' : 'product',
        valid_from: tomorrow.toISOString().split('T')[0],
        valid_till: nextWeek.toISOString().split('T')[0],
        product_ids: productId ? [productId] : []
      });
    }
  }, [offer, productId, shopId]);

  const loadProducts = async () => {
    try {
      // Use shopId if available, otherwise use a default shop ID
      const products = await apiService.getProducts(shopId || "1");
      setProducts(products);
    } catch (error: any) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products for offer selection.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Offer name is required.",
        variant: "destructive"
      });
      return;
    }

    if (formData.discount_value <= 0) {
      toast({
        title: "Validation Error",
        description: "Discount value must be greater than 0.",
        variant: "destructive"
      });
      return;
    }

    if (formData.type === 'percentage' && formData.discount_value > 100) {
      toast({
        title: "Validation Error",
        description: "Percentage discount cannot exceed 100%.",
        variant: "destructive"
      });
      return;
    }

    if (new Date(formData.valid_from) >= new Date(formData.valid_till)) {
      toast({
        title: "Validation Error",
        description: "Valid till date must be after valid from date.",
        variant: "destructive"
      });
      return;
    }

    if (formData.level === 'product' && formData.product_ids.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one product for product-level offers.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const offerData = {
        ...formData,
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_till: new Date(formData.valid_till).toISOString()
      };

      await onSubmit(offerData);
      onClose();
      
      toast({
        title: isEditing ? "Offer Updated" : "Offer Created",
        description: `Offer has been ${isEditing ? 'updated' : 'created'} successfully.`,
      });
    } catch (error: any) {
      console.error('Error saving offer:', error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditing ? 'update' : 'create'} offer.`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getOfferTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <Percent className="w-4 h-4" />;
      case 'fixed': return <DollarSign className="w-4 h-4" />;
      case 'bogo': return <Gift className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const getOfferTypeDescription = (type: string) => {
    switch (type) {
      case 'percentage': return 'Discount as percentage of original price';
      case 'fixed': return 'Fixed amount discount in rupees';
      case 'bogo': return 'Buy one get one or buy X get Y offers';
      case 'custom': return 'Custom offer with specific terms';
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            {isEditing ? 'Edit Offer' : 'Create New Offer'}
          </DialogTitle>
          <DialogDescription>
            {productId 
              ? 'Create an offer for this specific product'
              : shopId 
              ? 'Create a shop-wide offer'
              : 'Create an offer and select which products it applies to'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Offer Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Summer Sale, Buy 2 Get 1"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Offer Type *</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      Percentage Discount
                    </div>
                  </SelectItem>
                  <SelectItem value="fixed">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Fixed Amount Discount
                    </div>
                  </SelectItem>
                  <SelectItem value="bogo">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4" />
                      Buy One Get One
                    </div>
                  </SelectItem>
                  <SelectItem value="custom">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Custom Offer
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">{getOfferTypeDescription(formData.type)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the offer terms and conditions..."
              rows={3}
            />
          </div>

          {/* Discount Value */}
          <div className="space-y-2">
            <Label htmlFor="discount_value">
              Discount Value * 
              {formData.type === 'percentage' && ' (%)'}
              {formData.type === 'fixed' && ' (₹)'}
              {formData.type === 'bogo' && ' (Quantity)'}
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-3">
                {getOfferTypeIcon(formData.type)}
              </div>
              <Input
                id="discount_value"
                type="number"
                value={formData.discount_value}
                onChange={(e) => setFormData(prev => ({ ...prev, discount_value: Number(e.target.value) }))}
                className="pl-10"
                min="0"
                max={formData.type === 'percentage' ? 100 : undefined}
                step={formData.type === 'percentage' ? 1 : 0.01}
                required
              />
            </div>
            {formData.type === 'percentage' && (
              <p className="text-xs text-gray-500">Enter percentage (1-100)</p>
            )}
            {formData.type === 'fixed' && (
              <p className="text-xs text-gray-500">Enter amount in rupees</p>
            )}
            {formData.type === 'bogo' && (
              <p className="text-xs text-gray-500">Enter number of free items</p>
            )}
          </div>

          {/* Validity Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valid_from">Valid From *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="valid_from"
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData(prev => ({ ...prev, valid_from: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="valid_till">Valid Till *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="valid_till"
                  type="date"
                  value={formData.valid_till}
                  onChange={(e) => setFormData(prev => ({ ...prev, valid_till: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Offer Level - only show if not bound to specific product/shop */}
          {!productId && !shopId && (
            <div className="space-y-2">
              <Label htmlFor="level">Offer Level *</Label>
              <Select value={formData.level} onValueChange={(value: any) => setFormData(prev => ({ ...prev, level: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Product Level</SelectItem>
                  <SelectItem value="merchant">Shop Level</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {formData.level === 'product' 
                  ? 'Apply to specific products only'
                  : 'Apply to entire shop (all products)'
                }
              </p>
            </div>
          )}

          {/* Product Selection - only for product-level offers */}
          {formData.level === 'product' && !productId && (
            <div className="space-y-2">
              <Label>Select Products *</Label>
              <div className="border rounded-lg max-h-48 overflow-y-auto p-3 space-y-2">
                {products.length === 0 ? (
                  <p className="text-gray-500 text-sm">No products available</p>
                ) : (
                  products.map(product => (
                    <div key={product.product_id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`product-${product.product_id}`}
                        checked={formData.product_ids.includes(product.product_id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              product_ids: [...prev.product_ids, product.product_id]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              product_ids: prev.product_ids.filter(id => id !== product.product_id)
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <label 
                        htmlFor={`product-${product.product_id}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        <span className="font-medium">{product.name}</span>
                        <span className="text-gray-500 ml-2">({product.category})</span>
                      </label>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-gray-500">
                Selected: {formData.product_ids.length} product(s)
              </p>
            </div>
          )}

          {/* Offer Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Offer Preview</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Name:</span> {formData.name || 'Untitled Offer'}</p>
              <p>
                <span className="font-medium">Discount:</span> 
                {formData.type === 'percentage' && ` ${formData.discount_value}% off`}
                {formData.type === 'fixed' && ` ₹${formData.discount_value} off`}
                {formData.type === 'bogo' && ` Buy 1 Get ${formData.discount_value} Free`}
                {formData.type === 'custom' && ` Custom discount: ${formData.discount_value}`}
              </p>
              <p>
                <span className="font-medium">Valid:</span> 
                {formData.valid_from && formData.valid_till 
                  ? ` ${new Date(formData.valid_from).toLocaleDateString()} - ${new Date(formData.valid_till).toLocaleDateString()}`
                  : ' Please set validity dates'
                }
              </p>
              <p>
                <span className="font-medium">Applies to:</span> 
                {formData.level === 'product' 
                  ? productId 
                    ? ' This product only'
                    : ` ${formData.product_ids.length} selected product(s)`
                  : ' All products in shop'
                }
              </p>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Important Notes</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Offers cannot be combined with other promotions</li>
              <li>• Discount applies to the selling price of the product</li>
              <li>• Offer will be automatically deactivated after the end date</li>
              <li>• You can pause or modify the offer anytime from the offers section</li>
            </ul>
          </div>
        </form>

        <DialogFooter className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {isEditing ? 'Updating...' : 'Creating...'}
              </div>
            ) : (
              isEditing ? 'Update Offer' : 'Create Offer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OfferDialog;
