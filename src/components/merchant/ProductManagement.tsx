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

  const defaultCategories = ['biscuits', 'cold_drinks', 'ice_cream', 'snacks', 'beverages'];
  const allCategories = [...defaultCategories, ...customCategories];

  // Mock data initialization
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Coca Cola 500ml',
        category: 'cold_drinks',
        brand: 'Coca Cola',
        mrp: 40,
        sellingPrice: 35,
        quantity: 50,
        description: 'Refreshing cola drink',
        images: ['https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300&h=300&fit=crop'],
        variations: ['500ml', '1L', '2L'],
        offers: [{ id: '1', type: 'percentage', value: 12.5, description: '12.5% off on MRP' }]
      },
      {
        id: '2',
        name: 'Parle-G Biscuits',
        category: 'biscuits',
        brand: 'Parle',
        mrp: 25,
        sellingPrice: 23,
        quantity: 100,
        description: 'Classic glucose biscuits',
        images: ['https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=300&h=300&fit=crop'],
        variations: ['100g', '200g', '500g'],
        offers: [{ id: '2', type: 'bogo', value: 1, description: 'Buy 1 Get 1 Free' }]
      },
      {
        id: '3',
        name: 'Premium Ice Cream',
        category: 'ice_cream',
        brand: 'Kwality',
        mrp: 120,
        sellingPrice: 100,
        quantity: 25,
        description: 'Delicious vanilla ice cream',
        images: ['https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=300&h=300&fit=crop'],
        variations: ['500ml', '1L'],
        offers: []
      }
    ];
    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
  }, []);

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
          return b.sellingPrice - a.sellingPrice; // Low to High (ascending)
        case 'price-high':
          return a.sellingPrice - b.sellingPrice;// High to Low (descending)
        case 'quantity-high':
          return a.quantity - b.quantity; // High to Low
        case 'quantity-low':
          return b.quantity - a.quantity; // Low to High
        case 'name-az':
          return b.name.localeCompare(a.name);// A to Z
        case 'name-za':
          return a.name.localeCompare(b.name); // Z to A
        default:
          return b.name.localeCompare(a.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory, sortBy]);

  const handleCreateProduct = (productData: Partial<Product>) => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: productData.name || '',
      category: productData.category || '',
      brand: productData.brand || '',
      mrp: productData.mrp || 0,
      sellingPrice: productData.sellingPrice || 0,
      quantity: productData.quantity || 0,
      description: productData.description || '',
      images: productData.images || ['https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=300&h=300&fit=crop'],
      variations: productData.variations || [],
      offers: productData.offers || []
    };

    if (productData.category && !allCategories.includes(productData.category)) {
      setCustomCategories(prev => [...prev, productData.category!]);
    }

    setProducts(prev => [...prev, newProduct]);
    setIsCreateDialogOpen(false);
    toast({
      title: "Product Created",
      description: `${newProduct.name} has been added successfully.`,
    });
  };

  const handleUpdateProduct = (productData: Partial<Product>) => {
    if (!editingProduct) return;
    
    const updatedProduct = { ...editingProduct, ...productData };
    
    if (productData.category && !allCategories.includes(productData.category)) {
      setCustomCategories(prev => [...prev, productData.category!]);
    }

    setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));
    setEditingProduct(null);
    toast({
      title: "Product Updated",
      description: `${updatedProduct.name} has been updated successfully.`,
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast({
      title: "Product Deleted",
      description: "Product has been removed from your inventory.",
      variant: "destructive"
    });
  };

  const availableCategories = getAvailableCategories();

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
              categories={allCategories}
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
            key={product.id}
            product={product}
            onDelete={handleDeleteProduct}
            onEdit={() => setEditingProduct(product)}
            onView={() => navigate(`/product/${product.id}`)}
          />
        ))}
      </div>

      {/* Edit Dialog */}
      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <ProductDialog 
            onSubmit={handleUpdateProduct} 
            product={editingProduct}
            categories={allCategories}
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
  const discountPercentage = Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm sm:text-base lg:text-lg truncate">{product.name}</CardTitle>
            <CardDescription className="truncate text-xs sm:text-sm">{product.brand}</CardDescription>
          </div>
          <Badge variant={product.quantity > 10 ? "default" : "destructive"} className="ml-2 shrink-0 text-xs">
            {product.quantity}
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
              <span className="text-sm sm:text-lg font-bold text-green-600">₹{product.sellingPrice}</span>
              {discountPercentage > 0 && (
                <span className="text-xs sm:text-sm text-gray-500 line-through">₹{product.mrp}</span>
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
              <Badge key={offer.id} variant="outline" className="text-xs mr-1">
                {offer.description}
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
          <Button size="sm" variant="destructive" onClick={() => onDelete(product.id)} className="px-2">
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
    mrp: product?.mrp || 0,
    sellingPrice: product?.sellingPrice || 0,
    quantity: product?.quantity || 0,
    description: product?.description || '',
    variations: product?.variations?.join(', ') || '',
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
      id: Date.now().toString(),
      type: offerData.type || 'percentage',
      value: offerData.value || 0,
      description: offerData.description || '',
      customType: offerData.customType
    };
    setOffers(prev => [...prev, newOffer]);
    setIsOfferDialogOpen(false);
  };

  const handleUpdateOffer = (offerData: Partial<Offer>) => {
    if (!editingOffer) return;
    const updatedOffer = { ...editingOffer, ...offerData };
    setOffers(prev => prev.map(offer => offer.id === editingOffer.id ? updatedOffer : offer));
    setEditingOffer(null);
  };

  const handleDeleteOffer = (offerId: string) => {
    setOffers(prev => prev.filter(offer => offer.id !== offerId));
  };

  const handleSubmit = () => {
    let finalCategory = formData.category;
    
    if (showNewCategory && newCategory.trim()) {
      finalCategory = newCategory.trim().toLowerCase().replace(/\s+/g, '_');
      onAddCategory(finalCategory);
    }

    onSubmit({
      ...formData,
      category: finalCategory,
      variations: formData.variations.split(',').map(v => v.trim()).filter(Boolean),
      offers
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
                  <div key={offer.id} className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
                    <div className="min-w-0 flex-1">
                      <Badge className="mb-1 text-xs">
                        {offer.customType || offer.type.toUpperCase()}
                      </Badge>
                      <p className="text-xs text-gray-700 truncate">{offer.description}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingOffer(offer)} className="h-6 px-2">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteOffer(offer.id)} className="h-6 px-2">
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
