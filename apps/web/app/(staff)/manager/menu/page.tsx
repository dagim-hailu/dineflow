'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_MENU,
  CREATE_MENU_ITEM,
  UPDATE_MENU_ITEM,
  DELETE_MENU_ITEM,
  DEFAULT_DEMO_TABLE_ID,
} from '@/lib/graphql/menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Crown,
  ExternalLink,
  Edit,
  Utensils,
  Tag,
  Filter,
  AlignLeft,
  Image as ImageIcon,
  UploadCloud,
  Save,
  ArrowLeft,
  Trash2,
  Pencil,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminMenuPage() {
  const { data, loading, error, refetch } = useQuery(GET_MENU, {
    variables: { tableId: DEFAULT_DEMO_TABLE_ID },
  });

  const [createMenuItem] = useMutation(CREATE_MENU_ITEM);
  const [updateMenuItem] = useMutation(UPDATE_MENU_ITEM);
  const [deleteMenuItem] = useMutation(DELETE_MENU_ITEM);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameAm: '',
    price: '',
    categoryId: '',
    description: '',
    descriptionAm: '',
    imageUrl: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const categories = data?.menu?.categories || [];
  const restaurantId = data?.menu?.restaurantId || '00000000-0000-4000-8000-000000000001';

  // We can flatten items to display them
  const allItems = categories.flatMap((cat: any) =>
    cat.items.map((item: any) => ({ ...item, categoryName: cat.name, categoryId: cat.id })),
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a local object URL for preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      // In a real app, you would upload this file to S3/Cloudinary and get a URL back.
      // For now, we'll just simulate a URL or use the preview URL (which will break on reload but works for demo).
      setFormData((prev) => ({ ...prev, imageUrl: previewUrl }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      if (editingId) {
        await updateMenuItem({
          variables: {
            input: {
              id: editingId,
              name: formData.name,
              nameAm: formData.nameAm || undefined,
              price: parseFloat(formData.price),
              categoryId: formData.categoryId,
              description: formData.description || undefined,
              descriptionAm: formData.descriptionAm || undefined,
              imageUrl: formData.imageUrl || undefined,
              restaurantId,
            },
          },
        });
        toast.success('Menu item updated successfully!');
      } else {
        await createMenuItem({
          variables: {
            input: {
              name: formData.name,
              nameAm: formData.nameAm || undefined,
              price: parseFloat(formData.price),
              categoryId: formData.categoryId,
              description: formData.description || undefined,
              descriptionAm: formData.descriptionAm || undefined,
              imageUrl: formData.imageUrl || undefined,
              restaurantId,
            },
          },
        });
        toast.success('Menu item created successfully!');
      }

      // Reset form
      setEditingId(null);
      setFormData({
        name: '',
        nameAm: '',
        price: '',
        categoryId: '',
        description: '',
        descriptionAm: '',
        imageUrl: '',
      });
      setImagePreview(null);
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An error occurred while saving the menu item.');
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      nameAm: item.nameAm || '',
      price: item.price.toString(),
      categoryId: item.categoryId,
      description: item.description || '',
      descriptionAm: item.descriptionAm || '',
      imageUrl: item.imageUrl || '',
    });
    setImagePreview(item.imageUrl || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteMenuItem({ variables: { id } });
        toast.success('Menu item deleted successfully!');
        refetch();
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Failed to delete menu item.');
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading menu data...</div>;
  if (error)
    return <div className="p-8 text-center text-red-500">Error loading menu: {error.message}</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/80 to-primary text-white p-8 text-center relative">
        <div className="absolute left-4 top-4">
          <Link href="/manager">
            <Button variant="ghost" className="text-white hover:bg-white/20">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
          <Crown className="h-8 w-8" /> Menu Admin Dashboard
        </h1>
        <p className="text-white/90 text-lg">Manage your digital menu items and categories</p>
      </div>

      {/* QR Section (Placeholder link to menu) */}
      <div className="bg-white p-4 text-center border-b shadow-sm mb-8">
        <Link
          href="/menu"
          target="_blank"
          className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full text-primary font-bold shadow-md hover:-translate-y-1 transition-transform border border-gray-100"
        >
          <ExternalLink className="h-4 w-4" /> View Customer Menu →
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-5">
          <Card className="shadow-lg border-t-4 border-t-primary sticky top-4">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Edit className="h-6 w-6 text-primary" />
                {editingId ? 'Edit Item' : 'Add New Item'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-1">
                      <Utensils className="h-4 w-4" /> Item Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Margherita Pizza"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameAm" className="flex items-center gap-1">
                      <Utensils className="h-4 w-4" /> Item Name (Amharic)
                    </Label>
                    <Input
                      id="nameAm"
                      name="nameAm"
                      value={formData.nameAm}
                      onChange={handleInputChange}
                      placeholder="e.g., ማርጋሪታ ፒዛ"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price" className="flex items-center gap-1">
                      <Tag className="h-4 w-4" /> Price ($) *
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="12.99"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="categoryId" className="flex items-center gap-1">
                      <Filter className="h-4 w-4" /> Category *
                    </Label>
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="description" className="flex items-center gap-1">
                      <AlignLeft className="h-4 w-4" /> Description
                    </Label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Describe your delicious item..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descriptionAm" className="flex items-center gap-1">
                      <AlignLeft className="h-4 w-4" /> Description (Amharic)
                    </Label>
                    <textarea
                      id="descriptionAm"
                      name="descriptionAm"
                      value={formData.descriptionAm}
                      onChange={handleInputChange}
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="የምግቡን ዝርዝር ሁኔታ ይግለፁ..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <ImageIcon className="h-4 w-4" /> Item Image
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-2 text-gray-500 pointer-events-none">
                      <UploadCloud className="h-10 w-10 text-gray-400" />
                      <span className="font-medium">Click to upload image</span>
                      <span className="text-xs">Recommended: 400x300px</span>
                    </div>
                  </div>
                  {imagePreview && (
                    <div className="mt-4 flex justify-center">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border-4 border-white shadow-md"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  >
                    <Save className="mr-2 h-4 w-4" /> {editingId ? 'Update Item' : 'Save Item'}
                  </Button>
                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null);
                        setFormData({
                          name: '',
                          nameAm: '',
                          price: '',
                          categoryId: '',
                          description: '',
                          descriptionAm: '',
                          imageUrl: '',
                        });
                        setImagePreview(null);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Items Grid Section */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Current Menu Items</h2>
            <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
              {allItems.length} Items
            </span>
          </div>

          {allItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
              <Utensils className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-600">No items found</h3>
              <p className="text-gray-400 mt-2">Start by adding a new menu item on the left.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allItems.map((item: any) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-gray-300" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3
                        className="font-bold text-lg leading-tight truncate pr-2"
                        title={item.name}
                      >
                        {item.name}
                      </h3>
                      <span className="bg-primary text-white px-2 py-1 rounded-md font-bold text-sm whitespace-nowrap">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-semibold mb-2">
                      {item.categoryName}
                    </span>
                    <p className="text-sm text-gray-500 line-clamp-2 h-10 mb-4">
                      {item.description || 'No description provided.'}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
