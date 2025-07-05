
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Plus, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import OfferDialog from '@/components/merchant/OfferDialog';

interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  mrp: number;
  sellingPrice: number;
  quantity: number;
  description: string;
  images: string[];
  variations: string[];
  offers: Offer[];
}

interface Offer {
  id: string;
  type: 'percentage' | 'bogo' | 'fixed' | 'custom';
  value: number;
  description: string;
  customType?: string;
}

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  // Mock data - in real app this would be API call
  useEffect(() => {
    const mockProduct: Product = {
      id: productId || '1',
      name: 'Coca Cola 500ml',
      category: 'cold_drinks',
      brand: 'Coca Cola',
      mrp: 40,
      sellingPrice: 35,
      quantity: 50,
      description: 'Refreshing cola drink perfect for any occasion. Made with natural flavors and the classic Coca Cola taste that everyone loves.',
      images: [
        'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=600&h=600&fit=crop'
      ],
      variations: ['500ml', '1L', '2L'],
      offers: [
        { id: '1', type: 'percentage', value: 12.5, description: '12.5% off on MRP' },
        { id: '2', type: 'bogo', value: 1, description: 'Buy 1 Get 1 Free' }
      ]
    };
    setProduct(mockProduct);
  }, [productId]);

  const handleAddOffer = (offerData: Partial<Offer>) => {
    if (!product) return;
    
    const newOffer: Offer = {
      id: Date.now().toString(),
      type: offerData.type || 'percentage',
      value: offerData.value || 0,
      description: offerData.description || '',
      customType: offerData.customType
    };

    setProduct(prev => prev ? { ...prev, offers: [...prev.offers, newOffer] } : null);
    setIsOfferDialogOpen(false);
  };

  const handleUpdateOffer = (offerData: Partial<Offer>) => {
    if (!product || !editingOffer) return;
    
    const updatedOffer = { ...editingOffer, ...offerData };
    setProduct(prev => prev ? {
      ...prev,
      offers: prev.offers.map(offer => offer.id === editingOffer.id ? updatedOffer : offer)
    } : null);
    setEditingOffer(null);
  };

  const handleDeleteOffer = (offerId: string) => {
    if (!product) return;
    setProduct(prev => prev ? {
      ...prev,
      offers: prev.offers.filter(offer => offer.id !== offerId)
    } : null);
  };

  if (!product) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  const discountPercentage = Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{product.name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img 
                src={product.images[selectedImageIndex]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div>
                    <CardTitle className="text-xl lg:text-2xl">{product.name}</CardTitle>
                    <CardDescription className="text-lg">{product.brand}</CardDescription>
                  </div>
                  <Badge variant={product.quantity > 10 ? "default" : "destructive"} className="self-start">
                    {product.quantity} in stock
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Price */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-2xl lg:text-3xl font-bold text-green-600">₹{product.sellingPrice}</span>
                  {discountPercentage > 0 && (
                    <>
                      <span className="text-lg text-gray-500 line-through">₹{product.mrp}</span>
                      <Badge variant="secondary" className="text-sm">
                        {discountPercentage}% OFF
                      </Badge>
                    </>
                  )}
                </div>

                {/* Category */}
                <div>
                  <span className="text-sm text-gray-600">Category: </span>
                  <Badge variant="outline">{product.category.replace('_', ' ').toUpperCase()}</Badge>
                </div>

                {/* Variations */}
                {product.variations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Available Sizes:</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.variations.map((variation, index) => (
                        <Badge key={index} variant="outline">{variation}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Description:</h4>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Offers Section */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <CardTitle className="text-lg">Active Offers</CardTitle>
                  <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Offer
                      </Button>
                    </DialogTrigger>
                    <OfferDialog onSubmit={handleAddOffer} />
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {product.offers.length > 0 ? (
                  <div className="space-y-3">
                    {product.offers.map(offer => (
                      <div key={offer.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div>
                          <Badge className="mb-1">
                            {offer.customType || offer.type.toUpperCase()}
                          </Badge>
                          <p className="text-sm text-gray-700">{offer.description}</p>
                        </div>
                        <div className="flex gap-2 self-end sm:self-center">
                          <Button size="sm" variant="outline" onClick={() => setEditingOffer(offer)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteOffer(offer.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No offers available</p>
                )}
              </CardContent>
            </Card>

            {/* Edit Offer Dialog */}
            {editingOffer && (
              <Dialog open={!!editingOffer} onOpenChange={() => setEditingOffer(null)}>
                <OfferDialog 
                  onSubmit={handleUpdateOffer} 
                  offer={editingOffer}
                />
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
