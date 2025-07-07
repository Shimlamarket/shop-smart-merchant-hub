
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import OfferDialog from '@/components/merchant/OfferDialog';
import { apiService, Product, Offer } from '@/services/api';
import { useToast } from "@/hooks/use-toast";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);

  // Load product from API
  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) return;
      
      try {
        setLoading(true);
        const productData = await apiService.getProduct(productId);
        setProduct(productData);
      } catch (error) {
        console.error('Error loading product:', error);
        toast({
          title: "Error",
          description: "Failed to load product. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, toast]);

  const handleAddOffer = async (offerData: Partial<Offer>) => {
    if (!product) return;
    
    try {
      const newOffer = await apiService.createProductOffer(product.product_id, offerData);
      setProduct(prev => prev ? { ...prev, offers: [...prev.offers, newOffer] } : null);
      setIsOfferDialogOpen(false);
      toast({
        title: "Offer Created",
        description: "Product offer has been created successfully.",
      });
    } catch (error) {
      console.error('Error creating offer:', error);
      toast({
        title: "Error",
        description: "Failed to create offer. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateOffer = async (offerData: Partial<Offer>) => {
    if (!product || !editingOffer) return;
    
    try {
      const updatedOffer = await apiService.updateProductOffer(
        product.product_id, 
        editingOffer.offer_id, 
        offerData
      );
      setProduct(prev => prev ? {
        ...prev,
        offers: prev.offers.map(offer => 
          offer.offer_id === editingOffer.offer_id ? updatedOffer : offer
        )
      } : null);
      setEditingOffer(null);
      toast({
        title: "Offer Updated",
        description: "Product offer has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating offer:', error);
      toast({
        title: "Error",
        description: "Failed to update offer. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!product) return;
    
    try {
      await apiService.deleteProductOffer(product.product_id, offerId);
      setProduct(prev => prev ? {
        ...prev,
        offers: prev.offers.filter(offer => offer.offer_id !== offerId)
      } : null);
      toast({
        title: "Offer Deleted",
        description: "Product offer has been deleted successfully.",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast({
        title: "Error",
        description: "Failed to delete offer. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto p-4">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const firstVariant = product.variants[0];
  const discountPercentage = firstVariant ? Math.round(((firstVariant.mrp - firstVariant.selling_price) / firstVariant.mrp) * 100) : 0;

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
                  <Badge variant={firstVariant && firstVariant.stock_quantity > 10 ? "default" : "destructive"} className="self-start">
                    {firstVariant ? firstVariant.stock_quantity : 0} in stock
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Price */}
                {firstVariant && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-2xl lg:text-3xl font-bold text-green-600">₹{firstVariant.selling_price}</span>
                    {discountPercentage > 0 && (
                      <>
                        <span className="text-lg text-gray-500 line-through">₹{firstVariant.mrp}</span>
                        <Badge variant="secondary" className="text-sm">
                          {discountPercentage}% OFF
                        </Badge>
                      </>
                    )}
                  </div>
                )}

                {/* Category */}
                <div>
                  <span className="text-sm text-gray-600">Category: </span>
                  <Badge variant="outline">{product.category.replace('_', ' ').toUpperCase()}</Badge>
                </div>

                {/* Variations */}
                {product.variants.length > 1 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Available Variants:</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant) => (
                        <Badge key={variant.id} variant="outline">{variant.name}</Badge>
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
                      <div key={offer.offer_id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div>
                          <Badge className="mb-1">
                            {offer.type.toUpperCase()}
                          </Badge>
                          <p className="text-sm text-gray-700">{offer.description || offer.name}</p>
                        </div>
                        <div className="flex gap-2 self-end sm:self-center">
                          <Button size="sm" variant="outline" onClick={() => setEditingOffer(offer)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteOffer(offer.offer_id)}>
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
