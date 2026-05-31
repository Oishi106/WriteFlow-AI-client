'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Loader2, Star } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Template {
  _id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  location: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  prompt?: string;
  sampleOutput?: string;
  rating: number;
  usageCount: number;
}

interface FormErrors {
  title?: string;
  category?: string;
  description?: string;
  price?: string;
  location?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  prompt?: string;
  sampleOutput?: string;
}

const CATEGORY_OPTIONS = [
  { value: 'blog', label: 'Blog' },
  { value: 'social', label: 'Social' },
  { value: 'email', label: 'Email' },
  { value: 'ad-copy', label: 'Ad-copy' },
  { value: 'travel', label: 'Travel' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'product', label: 'Product' },
  { value: 'event', label: 'Event' },
  { value: 'property', label: 'Property' },
];

const DEFAULT_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60';

export default function AdminTemplatesPage() {
  const { toast } = useToast();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Dialog Form States
  const [isOpen, setIsOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('blog');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formLocation, setFormLocation] = useState('Digital');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formThumbnailUrl, setFormThumbnailUrl] = useState('');
  const [formPrompt, setFormPrompt] = useState('');
  const [formSampleOutput, setFormSampleOutput] = useState('');

  // Field Validation Errors
  const [errors, setErrors] = useState<FormErrors>({});

  // Delete Alert States
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const response: any = await adminApi.getItems();
      // Handle various payload structures safely
      const itemsList = Array.isArray(response)
        ? response
        : (Array.isArray(response?.data)
            ? response.data
            : (Array.isArray(response?.data?.data)
                ? response.data.data
                : []));

      setTemplates(itemsList);
    } catch (err: any) {
      console.error('Failed to load templates:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch templates.',
        variant: 'destructive',
      });
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Open Create Dialog
  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormTitle('');
    setFormCategory('blog');
    setFormDescription('');
    setFormPrice(0);
    setFormLocation('Digital');
    setFormImageUrl('');
    setFormThumbnailUrl('');
    setFormPrompt('');
    setFormSampleOutput('');
    setErrors({});
    setIsOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (t: Template) => {
    setEditingTemplate(t);
    setFormTitle(t.title ?? '');
    setFormCategory(t.category ?? 'blog');
    setFormDescription(t.description ?? '');
    setFormPrice(t.price ?? 0);
    setFormLocation(t.location ?? 'Digital');
    setFormImageUrl(t.imageUrl ?? '');
    setFormThumbnailUrl(t.thumbnailUrl ?? '');
    setFormPrompt(t.prompt ?? '');
    setFormSampleOutput(t.sampleOutput ?? '');
    setErrors({});
    setIsOpen(true);
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    const formErrors: FormErrors = {};
    let hasError = false;

    if (!formTitle.trim()) {
      formErrors.title = 'Title is required';
      hasError = true;
    }

    if (!formCategory) {
      formErrors.category = 'Category is required';
      hasError = true;
    }

    if (!formDescription.trim()) {
      formErrors.description = 'Description is required';
      hasError = true;
    } else if (formDescription.trim().length < 20) {
      formErrors.description = 'Description must be at least 20 characters';
      hasError = true;
    }

    if (formPrice < 0) {
      formErrors.price = 'Price cannot be negative';
      hasError = true;
    }

    setErrors(formErrors);
    if (hasError) return;

    setSubmitting(true);
    const formData = {
      title: formTitle,
      category: formCategory,
      description: formDescription,
      price: formPrice,
      location: formLocation,
      imageUrl: formImageUrl,
      thumbnailUrl: formThumbnailUrl,
      prompt: formPrompt,
      sampleOutput: formSampleOutput,
    };

    try {
      if (editingTemplate) {
        await adminApi.updateItem(editingTemplate._id, formData);
        toast({
          title: 'Success',
          description: 'Item updated successfully',
        });
      } else {
        await adminApi.createItem(formData);
        toast({
          title: 'Success',
          description: 'Item created successfully',
        });
      }
      setIsOpen(false);
      fetchTemplates();
    } catch (err: any) {
      toast({
        title: 'Save failed',
        description: err.message || 'An error occurred while saving the item.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Confirm Action
  const handleConfirmDelete = async () => {
    if (!deletingTemplate) return;
    setDeleteLoading(true);
    try {
      await adminApi.deleteItem(deletingTemplate._id);
      toast({
        title: 'Success',
        description: 'Template deleted successfully.',
      });
      setDeletingTemplate(null);
      fetchTemplates();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete template.',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Manage Templates</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create, edit, and delete templates on the platform
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="w-fit self-end sm:self-auto">
          <Plus className="w-4 h-4 mr-2" /> Create Item
        </Button>
      </div>

      {/* Templates Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Thumbnail</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Usage Count</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Skeleton className="h-12 w-12 rounded-lg" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-24 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No templates found.
                </TableCell>
              </TableRow>
            ) : (
              templates.map((item) => (
                <TableRow key={item._id} className="hover:bg-muted/10 transition-colors">
                  <TableCell>
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border bg-muted flex-shrink-0">
                      <Image
                        src={item.thumbnailUrl || DEFAULT_IMAGE_FALLBACK}
                        alt={item.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          (e.target as any).src = DEFAULT_IMAGE_FALLBACK;
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-sm max-w-xs truncate">
                    {item.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="flex items-center gap-1">
                      {item.rating ? item.rating.toFixed(1) : '0.0'}
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Intl.NumberFormat('en-US').format(item.usageCount ?? 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Template"
                      >
                        <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingTemplate(item)}
                        title="Delete Template"
                      >
                        <Trash2 className="w-4 h-4 text-destructive hover:text-destructive/90" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Item' : 'Create Item'}
            </DialogTitle>
            <DialogDescription>
              Provide template metadata. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Title *
                </label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="SEO Captain"
                  required
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Category *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full h-10 px-3 border border-border bg-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-xs text-destructive">{errors.category}</p>
                )}
              </div>

              {/* Price */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Price ($)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                />
                {errors.price && (
                  <p className="text-xs text-destructive">{errors.price}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Location
                </label>
                <Input
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="Digital"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Description * (min 20 characters)
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                placeholder="Briefly describe what this AI agent or template does..."
                className="w-full p-3 border border-border bg-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
                required
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Image URL */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Image URL
                </label>
                <Input
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Thumbnail URL */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Thumbnail URL
                </label>
                <Input
                  value={formThumbnailUrl}
                  onChange={(e) => setFormThumbnailUrl(e.target.value)}
                  placeholder="https://example.com/thumb.jpg"
                />
              </div>
            </div>

            {/* Prompt */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                AI Prompt
              </label>
              <textarea
                value={formPrompt}
                onChange={(e) => setFormPrompt(e.target.value)}
                rows={3}
                placeholder="The system prompt templates use to generate results..."
                className="w-full p-3 border border-border bg-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
              />
            </div>

            {/* Sample Output */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Sample Output
              </label>
              <textarea
                value={formSampleOutput}
                onChange={(e) => setFormSampleOutput(e.target.value)}
                rows={3}
                placeholder="Provide a sample generated text output..."
                className="w-full p-3 border border-border bg-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingTemplate ? 'Update Item' : 'Create Item'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deletingTemplate} onOpenChange={(open) => !open && setDeletingTemplate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this template?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the template <strong>{deletingTemplate?.title}</strong>? This action cannot be undone and will remove it from the store permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={deleteLoading}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
