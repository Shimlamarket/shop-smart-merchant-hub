
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
import { Plus, Search, Edit, Trash2, Package, Upload, X } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  mrp: number;
  sellingPrice: number;
  quantity: number;
  description: string;
  image: string;
  variations: string[];
  offers: Offer[];
}

interface Offer {
  id: string;
  type: 'percentage' | 'bogo';
  value: number;
  description: string;
}

interface ProductManagementProps {
  merchantId: string;
}

const ProductManagement = ({ merchantId }: ProductManagementProps) => {
  const { toast } = useToast();
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
        image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300&h=300&fit=crop',
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
        image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=300&h=300&fit=crop',
        variations: ['100g', '200g', '500g'],
        offers: [{ id: '2', type: 'bogo', value: 1, description: 'Buy 1 Get 1 Free' }]
      }
    ];
    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
  }, []);

  // Filter and search logic
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

    // Fixed sorting logic
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.sellingPrice - b.sellingPrice; // Fixed: low to high
        case 'price-high':
          return b.sellingPrice - a.sellingPrice; // Fixed: high to low
        case 'quantity':
          return b.quantity - a.quantity;
        default:
          return a.name.localeCompare(b.name);
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
      image: productData.image || 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=300&h=300&fit=crop',
      variations: productData.variations || [],
      offers: []
    };

    // Add custom category if it's new
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
    
    // Add custom category if it's new
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

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
          <p className="text-gray-600">Manage your inventory and product offerings</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <ProductDialog 
            onSubmit={handleCreateProduct} 
            categories={allCategories}
            onAddCategory={(category) => setCustomCategories(prev => [...prev, category])}
          />
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products or brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ALL CATEGORIES</SelectItem>
                {allCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.replace('_', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price Low to High</SelectItem>
                <SelectItem value="price-high">Price High to Low</SelectItem>
                <SelectItem value="quantity">Stock Quantity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onDelete={handleDeleteProduct}
            onEdit={() => setEditingProduct(product)}
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

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {products.length === 0 
                ? "You haven't added any products yet. Start by creating your first product."
                : "No products match your current filters. Try adjusting your search or filters."
              }
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const ProductCard = ({ product, onDelete, onEdit }: {
  product: Product;
  onDelete: (id: string) => void;
  onEdit: () => void;
}) => {
  const discountPercentage = Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <CardDescription>{product.brand}</CardDescription>
          </div>
          <Badge variant={product.quantity > 10 ? "default" : "destructive"}>
            {product.quantity} in stock
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Image */}
        <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-green-600">₹{product.sellingPrice}</span>
              {discountPercentage > 0 && (
                <span className="text-sm text-gray-500 line-through">₹{product.mrp}</span>
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
            {product.offers.map(offer => (
              <Badge key={offer.id} variant="outline" className="text-xs">
                {offer.description}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(product.id)}>
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
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
    image: product?.image || ''
  });
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: previewUrl }));
    }
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
      variations: formData.variations.split(',').map(v => v.trim()).filter(Boolean)
    });
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{product ? 'Edit Product' : 'Create New Product'}</DialogTitle>
        <DialogDescription>
          {product ? 'Update product details' : 'Add a new product to your inventory'}
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-4">
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
        
        {/* Category Selection with Custom Option */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          {!showNewCategory ? (
            <div className="space-y-2">
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
            </div>
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

        {/* Image Upload */}
        <div className="col-span-2 space-y-2">
          <Label htmlFor="image">Product Image</Label>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="cursor-pointer"
              />
            </div>
            {formData.image && (
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={formData.image} 
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="variations">Variations (comma-separated)</Label>
          <Input
            id="variations"
            value={formData.variations}
            onChange={(e) => setFormData(prev => ({ ...prev, variations: e.target.value }))}
            placeholder="e.g. 500ml, 1L, 2L"
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter product description"
          />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleSubmit}>
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ProductManagement;
