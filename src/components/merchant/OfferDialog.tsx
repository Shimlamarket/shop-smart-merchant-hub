
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Offer } from '@/services/api';

interface OfferDialogProps {
  onSubmit: (data: Partial<Offer>) => void;
  offer?: Offer;
}

const OfferDialog = ({ onSubmit, offer }: OfferDialogProps) => {
  const [formData, setFormData] = useState({
    name: offer?.name || '',
    type: offer?.type || 'percentage' as const,
    discount_value: offer?.discount_value || 0,
    description: offer?.description || '',
    valid_from: offer?.valid_from || '',
    valid_till: offer?.valid_till || '',
    customType: offer?.customType || ''
  });
  const [showCustomType, setShowCustomType] = useState(offer?.type === 'custom' || false);

  const offerTypes = [
    { value: 'percentage', label: 'Percentage Discount' },
    { value: 'fixed', label: 'Fixed Amount Off' },
    { value: 'bogo', label: 'Buy One Get One' },
    { value: 'custom', label: 'Custom Offer' }
  ];

  const handleTypeChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomType(true);
    } else {
      setShowCustomType(false);
      setFormData(prev => ({ ...prev, customType: '' }));
    }
    setFormData(prev => ({ ...prev, type: value as any }));
  };

  const handleSubmit = () => {
    onSubmit({
      name: formData.name,
      type: formData.type,
      discount_value: formData.discount_value,
      description: formData.description,
      valid_from: formData.valid_from,
      valid_till: formData.valid_till,
      customType: showCustomType ? formData.customType : undefined
    });
  };

  const getValueLabel = () => {
    switch (formData.type) {
      case 'percentage':
        return 'Discount Percentage';
      case 'fixed':
        return 'Discount Amount (₹)';
      case 'bogo':
        return 'Free Items Count';
      default:
        return 'Value';
    }
  };

  const getValuePlaceholder = () => {
    switch (formData.type) {
      case 'percentage':
        return 'e.g. 10 (for 10% off)';
      case 'fixed':
        return 'e.g. 50 (for ₹50 off)';
      case 'bogo':
        return 'e.g. 1 (for Buy 1 Get 1)';
      default:
        return 'Enter value';
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{offer ? 'Edit Offer' : 'Create New Offer'}</DialogTitle>
        <DialogDescription>
          {offer ? 'Update offer details' : 'Add a new offer to this product'}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        {/* Offer Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Offer Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter offer name"
          />
        </div>

        {/* Offer Type */}
        <div className="space-y-2">
          <Label htmlFor="type">Offer Type</Label>
          {!showCustomType ? (
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select offer type" />
              </SelectTrigger>
              <SelectContent>
                {offerTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex gap-2">
              <Input
                value={formData.customType}
                onChange={(e) => setFormData(prev => ({ ...prev, customType: e.target.value }))}
                placeholder="Enter custom offer type"
              />
              <Button size="sm" variant="outline" onClick={() => setShowCustomType(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="space-y-2">
          <Label htmlFor="discount_value">{getValueLabel()}</Label>
          <Input
            id="discount_value"
            type="number"
            min="0"
            step={formData.type === 'percentage' ? '0.1' : '1'}
            value={formData.discount_value}
            onChange={(e) => setFormData(prev => ({ ...prev, discount_value: parseFloat(e.target.value) || 0 }))}
            placeholder={getValuePlaceholder()}
          />
        </div>

        {/* Valid From */}
        <div className="space-y-2">
          <Label htmlFor="valid_from">Valid From</Label>
          <Input
            id="valid_from"
            type="date"
            value={formData.valid_from}
            onChange={(e) => setFormData(prev => ({ ...prev, valid_from: e.target.value }))}
          />
        </div>

        {/* Valid Till */}
        <div className="space-y-2">
          <Label htmlFor="valid_till">Valid Till</Label>
          <Input
            id="valid_till"
            type="date"
            value={formData.valid_till}
            onChange={(e) => setFormData(prev => ({ ...prev, valid_till: e.target.value }))}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the offer details..."
            rows={3}
          />
        </div>
      </div>

      <DialogFooter>
        <Button onClick={handleSubmit}>
          {offer ? 'Update Offer' : 'Create Offer'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default OfferDialog;
