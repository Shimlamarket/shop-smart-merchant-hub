
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Trash2, Package, X, Eye } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import OfferDialog from './OfferDialog';
import { apiService, Product, Offer } from '@/services/api';

interface ProductManagementProps {
  merchantId: string;
}

const ProductManagement = ({ merchantId }: ProductManagementProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('name');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const productsData = await apiService.getProducts();
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (error) {
        console.error('Error loading products:', error);
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [toast]);

  // Get available categories (only show categories that have products)
  const getAvailableCategories = () => {
    const categoriesWithProducts = [...new Set(products.map(product => product.category))];
    return categoriesWithProducts.sort();
  };

  // Filter and search logic with CORRECTED SORTING
  useEffect(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // CORRECTED: Fixed sorting implementation
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.variants[0]?.selling_price || 0) - (b.variants[0]?.selling_price || 0);
        case 'price-high':
          return (b.variants[0]?.selling_price || 0) - (a.variants[0]?.selling_price || 0);
        case 'quantity-high':
          return (b.variants[0]?.stock_quantity || 0) - (a.variants[0]?.stock_quantity || 0);
        case 'quantity-low':
          return (a.variants[0]?.stock_quantity || 0) - (b.variants[0]?.stock_quantity || 0);
        case 'name-az':
          return a.name.localeCompare(b.name);
        case 'name-za':
          return b.name.localeCompare(a.name);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory, sortBy]);

  const handleCreateProduct = async (productData: Partial<Product>) => {
    try {
      const newProduct = await apiService.createProduct(productData);
      setProducts(prev => [...prev, newProduct]);
      setIsCreateDialogOpen(false);
      toast({
        title: "Product Created",
        description: `${newProduct.name} has been added successfully.`,
      });
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateProduct = async (productData: Partial<Product>) => {
    if (!editingProduct) return;
    
    try {
      const updatedProduct = await apiService.updateProduct(editingProduct.product_id, productData);
      setProducts(prev => prev.map(p => p.product_id === editingProduct.product_id ? updatedProduct : p));
      setEditingProduct(null);
      toast({
        title: "Product Updated",
        description: `${updatedProduct.name} has been updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await apiService.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.product_id !== productId));
      toast({
        title: "Product Deleted",
        description: "Product has been removed from your inventory.",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive"
      });
    }
  };

  const availableCategories = getAvailableCategories();

  if (loading) {
    return (
      <div className="space-y-4 lg:space-y-6 px-2 sm:px-0">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 px-2 sm:px-0">
      {/* Header with Actions - IMPROVED MOBILE */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">Product Management</h2>
            <p className="text-sm lg:text-base text-gray-600">Manage your inventory and product offerings</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <Plus className="h-4 w-4" />
                <span className="hidden xs:inline">Add Product</span>
                <span className="xs:hidden">Add</span>
              </Button>
            </DialogTrigger>
            <ProductDialog 
              onSubmit={handleCreateProduct} 
              categories={availableCategories}
              onAddCategory={(category) => setCustomCategories(prev => [...prev, category])}
            />
          </Dialog>
        </div>
      </div>

      {/* Filters and Search - IMPROVED MOBILE */}
      <Card>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products or brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  <SelectItem value="all">ALL CATEGORIES</SelectItem>
                  {availableCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  <SelectItem value="name-az">Name: A to Z</SelectItem>
                  <SelectItem value="name-za">Name: Z to A</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="quantity-high">Stock: High to Low</SelectItem>
                  <SelectItem value="quantity-low">Stock: Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid - IMPROVED MOBILE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.product_id}
            product={product}
            onDelete={handleDeleteProduct}
            onEdit={() => setEditingProduct(product)}
            onView={() => navigate(`/product/${product.product_id}`)}
          />
        ))}
      </div>

      {/* Edit Dialog */}
      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <ProductDialog 
            onSubmit={handleUpdateProduct} 
            product={editingProduct}
            categories={availableCategories}
            onAddCategory={(category) => setCustomCategories(prev => [...prev, category])}
          />
        </Dialog>
      )}

      {/* Empty State - IMPROVED MOBILE */}
      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
            <Package className="h-8 sm:h-12 w-8 sm:w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">
              {products.length === 0 
                ? "You haven't added any products yet. Start by creating your first product."
                : "No products match your current filters. Try adjusting your search or filters."
              }
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const ProductCard = ({ product, onDelete, onEdit, onView }: {
  product: Product;
  onDelete: (id: string) => void;
  onEdit: () => void;
  onView: () => void;
}) => {
  const discountPercentage = product.variants[0] ? Math.round(((product.variants[0].mrp - product.variants[0].selling_price) / product.variants[0].mrp) * 100) : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm sm:text-base lg:text-lg truncate">{product.name}</CardTitle>
            <CardDescription className="truncate text-xs sm:text-sm">{product.brand}</CardDescription>
          </div>
          <Badge variant={product.variants[0]?.stock_quantity > 10 ? "default" : "destructive"} className="ml-2 shrink-0 text-xs">
            {product.variants[0]?.stock_quantity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {/* Product Image - IMPROVED MOBILE */}
        <div className="w-full h-24 sm:h-32 lg:h-40 rounded-lg overflow-hidden bg-gray-100">
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-sm sm:text-lg font-bold text-green-600">₹{product.variants[0]?.selling_price}</span>
              {discountPercentage > 0 && (
                <span className="text-xs sm:text-sm text-gray-500 line-through">₹{product.variants[0]?.mrp}</span>
              )}
            </div>
            {discountPercentage > 0 && (
              <Badge variant="secondary" className="text-xs">
                {discountPercentage}% OFF
              </Badge>
            )}
          </div>
        </div>

        {product.offers.length > 0 && (
          <div className="space-y-1">
            {product.offers.slice(0, 2).map(offer => (
              <Badge key={offer.offer_id} variant="outline" className="text-xs mr-1">
                {offer.name}
              </Badge>
            ))}
            {product.offers.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{product.offers.length - 2} more
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons - IMPROVED MOBILE */}
        <div className="flex gap-1 sm:gap-2">
          <Button size="sm" variant="outline" onClick={onView} className="flex-1 text-xs sm:text-sm">
            <Eye className="h-3 w-3 mr-1" />
            <span className="hidden xs:inline">View</span>
          </Button>
          <Button size="sm" variant="outline" onClick={onEdit} className="flex-1 text-xs sm:text-sm">
            <Edit className="h-3 w-3 mr-1" />
            <span className="hidden xs:inline">Edit</span>
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(product.product_id)} className="px-2">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ProductDialog = ({ onSubmit, product, categories, onAddCategory }: {
  onSubmit: (data: Partial<Product>) => void;
  product?: Product;
  categories: string[];
  onAddCategory: (category: string) => void;
}) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || '',
    brand: product?.brand || '',
    mrp: product?.variants[0]?.mrp || 0,
    sellingPrice: product?.variants[0]?.selling_price || 0,
    quantity: product?.variants[0]?.stock_quantity || 0,
    description: product?.description || '',
    variations: product?.variants?.map(v => v.name).join(', ') || '',
    images: product?.images || []
  });
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [offers, setOffers] = useState<Offer[]>(product?.offers || []);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ 
        ...prev, 
        images: [...prev.images, previewUrl] 
      }));
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddOffer = (offerData: Partial<Offer>) => {
    const newOffer: Offer = {
      offer_id: Date.now().toString(),
      name: offerData.name || '',
      type: offerData.type || 'percentage',
      discount_value: offerData.discount_value || 0,
      valid_from: offerData.valid_from || '',
      valid_till: offerData.valid_till || '',
      is_active: true
    };
    setOffers(prev => [...prev, newOffer]);
    setIsOfferDialogOpen(false);
  };

  const handleUpdateOffer = (offerData: Partial<Offer>) => {
    if (!editingOffer) return;
    const updatedOffer = { ...editingOffer, ...offerData };
    setOffers(prev => prev.map(offer => offer.offer_id === editingOffer.offer_id ? updatedOffer : offer));
    setEditingOffer(null);
  };

  const handleDeleteOffer = (offerId: string) => {
    setOffers(prev => prev.filter(offer => offer.offer_id !== offerId));
  };

  const handleSubmit = () => {
    let finalCategory = formData.category;
    
    if (showNewCategory && newCategory.trim()) {
      finalCategory = newCategory.trim().toLowerCase().replace(/\s+/g, '_');
    }

    onSubmit({
      name: formData.name,
      category: finalCategory,
      brand: formData.brand,
      description: formData.description,
      images: formData.images,
      variants: [{
        id: product?.variants[0]?.id || `var_${Date.now()}`,
        name: formData.variations || 'Default',
        mrp: formData.mrp,
        selling_price: formData.sellingPrice,
        stock_quantity: formData.quantity,
        sku: product?.variants[0]?.sku || `SKU_${Date.now()}`
      }],
      offers: offers
    });
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{product ? 'Edit Product' : 'Create New Product'}</DialogTitle>
        <DialogDescription>
          {product ? 'Update product details' : 'Add a new product to your inventory'}
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Basic Details */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter product name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              placeholder="Enter brand name"
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            {!showNewCategory ? (
              <Select value={formData.category} onValueChange={(value) => {
                if (value === 'add_new') {
                  setShowNewCategory(true);
                } else {
                  setFormData(prev => ({ ...prev, category: value }));
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                  <SelectItem value="add_new">+ Add New Category</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category"
                />
                <Button size="sm" onClick={() => setShowNewCategory(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mrp">MRP (₹)</Label>
              <Input
                id="mrp"
                type="number"
                value={formData.mrp}
                onChange={(e) => setFormData(prev => ({ ...prev, mrp: parseFloat(e.target.value) || 0 }))}
                placeholder="Enter MRP"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling Price (₹)</Label>
              <Input
                id="sellingPrice"
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) || 0 }))}
                placeholder="Enter selling price"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
              placeholder="Enter quantity"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="variations">Variations (comma-separated)</Label>
            <Input
              id="variations"
              value={formData.variations}
              onChange={(e) => setFormData(prev => ({ ...prev, variations: e.target.value }))}
              placeholder="e.g. 500ml, 1L, 2L"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter product description"
              rows={3}
            />
          </div>
        </div>

        {/* Images and Offers */}
        <div className="space-y-4">
          {/* Multiple Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="images">Product Images</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="cursor-pointer"
            />
            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={image} 
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Offers Management */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Product Offers</Label>
              <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Offer
                  </Button>
                </DialogTrigger>
                <OfferDialog onSubmit={handleAddOffer} />
              </Dialog>
            </div>
            
            {offers.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {offers.map(offer => (
                  <div key={offer.offer_id} className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
                    <div className="min-w-0 flex-1">
                      <Badge className="mb-1 text-xs">
                        {offer.type.toUpperCase()}
                      </Badge>
                      <p className="text-xs text-gray-700 truncate">{offer.name}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingOffer(offer)} className="h-6 px-2">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteOffer(offer.offer_id)} className="h-6 px-2">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-300 rounded">
                No offers added yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Offer Dialog */}
      {editingOffer && (
        <Dialog open={!!editingOffer} onOpenChange={() => setEditingOffer(null)}>
          <OfferDialog 
            onSubmit={handleUpdateOffer} 
            offer={editingOffer}
          />
        </Dialog>
      )}

      <DialogFooter>
        <Button onClick={handleSubmit}>
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ProductManagement;
