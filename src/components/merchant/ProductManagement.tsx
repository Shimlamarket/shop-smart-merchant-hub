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
import { Plus, Search, Edit, Trash2, Package, X, Eye, Star } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import OfferDialog from './OfferDialog';
import { apiService, Product, Offer, ProductVariant } from '@/services/api';

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
        const products = await apiService.getProducts("1");
        
        setProducts(products);
        setFilteredProducts(products);
        
        // Extract unique categories
        console.log("products:", products);

        const categories = [...new Set(products.map(p => p.category))];
        setCustomCategories(categories);
      } catch (error: any) {
        console.error('Error loading products:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to load products. Please try again.",
          variant: "destructive"
        });
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [toast]);

  // Filter and sort products
  useEffect(() => {
    let filtered = products;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory, sortBy]);

  const handleCreateProduct = async (formData: any) => {
    try {
      const newProduct = await apiService.createProduct({
        name: formData.name,
        category: formData.category,
        subcategory: formData.subcategory,
        brand: formData.brand,
        description: formData.description,
        variants: formData.variants,
        images: formData.images || [],
        weight: formData.weight
      });
      
      setProducts(prev => [...prev, newProduct]);
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Product Created",
        description: "Product has been created successfully.",
      });
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create product. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateProduct = async (productId: string, formData: any) => {
    try {
      const updatedProduct = await apiService.updateProduct(productId, {
        name: formData.name,
        category: formData.category,
        subcategory: formData.subcategory,
        brand: formData.brand,
        description: formData.description,
        variants: formData.variants,
        images: formData.images || [],
        weight: formData.weight,
        is_active: formData.is_active
      });
      
      setProducts(prev => prev.map(p => p.product_id === productId ? updatedProduct : p));
      setEditingProduct(null);
      
      toast({
        title: "Product Updated",
        description: "Product has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update product. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await apiService.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.product_id !== productId));
      
      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully.",
      });
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete product. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStockStatus = (variants: ProductVariant[]) => {
    const totalStock = variants.reduce((sum, v) => sum + v.stock_quantity, 0);
    if (totalStock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (totalStock < 10) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const getMinPrice = (variants: ProductVariant[]) => {
    return Math.min(...variants.map(v => v.selling_price));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Management</CardTitle>
        <CardDescription>Manage your product catalog, inventory, and pricing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {customCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="created">Created</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <ProductForm
                onSubmit={handleCreateProduct}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedCategory !== 'all' 
                ? "Try adjusting your search or filters"
                : "Get started by adding your first product"
              }
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => {
              const stockStatus = getStockStatus(product.variants);
              const minPrice = getMinPrice(product.variants);
              
              return (
                <Card key={product.product_id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Product Image */}
                      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-12 h-12 text-gray-400" />
                        )}
                      </div>

                      {/* Product Info */}
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                          <Badge className={stockStatus.color}>
                            {stockStatus.label}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-lg font-bold text-gray-900">₹{minPrice}</p>
                            <p className="text-xs text-gray-500">{product.variants.length} variant(s)</p>
                          </div>
                          <Badge variant={product.is_active ? "default" : "secondary"}>
                            {product.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>

                        {/* Offers */}
                        {product.offers && product.offers.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center gap-1 mb-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm font-medium">{product.offers.length} offer(s)</span>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/products/${product.product_id}`)}
                            className="flex-1"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingProduct(product)}
                            className="flex-1"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.product_id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Edit Product Dialog */}
        {editingProduct && (
          <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
            <DialogContent className="max-w-2xl">
              <ProductForm
                product={editingProduct}
                onSubmit={(formData) => handleUpdateProduct(editingProduct.product_id, formData)}
                onCancel={() => setEditingProduct(null)}
                isEditing
              />
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

// Product Form Component
interface ProductFormProps {
  product?: Product;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const ProductForm = ({ product, onSubmit, onCancel, isEditing }: ProductFormProps) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || '',
    subcategory: product?.subcategory || '',
    brand: product?.brand || '',
    description: product?.description || '',
    weight: product?.weight || 0,
    is_active: product?.is_active ?? true,
    variants: product?.variants || [{
      id: '',
      name: 'Default',
      mrp: 0,
      selling_price: 0,
      stock_quantity: 0,
      sku: ''
    }],
    images: product?.images || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          id: Date.now().toString(),
          name: '',
          mrp: 0,
          selling_price: 0,
          stock_quantity: 0,
          sku: ''
        }
      ]
    }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogDescription>
          {isEditing ? 'Update your product information' : 'Fill in the details to add a new product'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subcategory">Subcategory</Label>
            <Input
              id="subcategory"
              value={formData.subcategory}
              onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight">Weight (grams)</Label>
          <Input
            id="weight"
            type="number"
            value={formData.weight}
            onChange={(e) => setFormData(prev => ({ ...prev, weight: Number(e.target.value) }))}
          />
        </div>

        {/* Variants */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Product Variants</Label>
            <Button type="button" onClick={addVariant} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Variant
            </Button>
          </div>
          
          {formData.variants.map((variant, index) => (
            <div key={index} className="border p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Variant {index + 1}</h4>
                {formData.variants.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeVariant(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Variant Name</Label>
                  <Input
                    value={variant.name}
                    onChange={(e) => updateVariant(index, 'name', e.target.value)}
                    placeholder="e.g., 500g, Large, Red"
                  />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input
                    value={variant.sku}
                    onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                    placeholder="Product SKU"
                  />
                </div>
                <div>
                  <Label>MRP (₹)</Label>
                  <Input
                    type="number"
                    value={variant.mrp}
                    onChange={(e) => updateVariant(index, 'mrp', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Selling Price (₹)</Label>
                  <Input
                    type="number"
                    value={variant.selling_price}
                    onChange={(e) => updateVariant(index, 'selling_price', Number(e.target.value))}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Stock Quantity</Label>
                  <Input
                    type="number"
                    value={variant.stock_quantity}
                    onChange={(e) => updateVariant(index, 'stock_quantity', Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {isEditing && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
            />
            <Label htmlFor="is_active">Product is active</Label>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            {isEditing ? 'Update Product' : 'Create Product'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

export default ProductManagement;
