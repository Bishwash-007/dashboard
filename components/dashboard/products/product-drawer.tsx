"use client";

import { ChangeEvent, useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useCategories } from "@/hooks/use-categories";
import { useProductMutations } from "@/hooks/use-products";
import { adminService } from "@/services/admin";
import type { HttpError } from "@/services/api-client";
import type { Product } from "@/types/api";
import { useUiStore } from "@/stores/ui-store";
import { notify } from "@/lib/notify";

const cleanText = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const extractCategoryIds = (categories?: Product["categories"]) => {
  if (!categories) return [] as string[];
  return categories
    .map((category) => {
      if (typeof category === "string") return category;
      if (category && typeof category === "object" && "_id" in category) {
        return (category as { _id?: string })._id;
      }
      return undefined;
    })
    .filter((value): value is string => Boolean(value));
};

const formSchema = z.object({
  name: z.string().min(3, "Name is required"),
  description: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().min(1, "Select a category"),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  sku: z.string().optional(),
  color: z.string().optional(),
});

export function ProductDrawer() {
  const {
    productDrawer: { isOpen, product, mode },
    closeProductDrawer,
  } = useUiStore();

  const { createMutation, updateMutation, deleteMutation } =
    useProductMutations();

  const { data: categoriesResponse, isLoading: categoriesLoading } =
    useCategories();
  const categoryOptions = categoriesResponse?.data ?? [];

  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      brand: "",
      category: "",
      price: 0,
      stock: 0,
      sku: "",
      color: "",
    },
  });

  useEffect(() => {
    if (product && mode === "update") {
      form.reset({
        name: product.name ?? "",
        description: product.description ?? "",
        brand: product.brand ?? "",
        category: extractCategoryIds(product.categories)[0] ?? "",
        price: product.variants?.[0]?.price ?? 0,
        stock: product.variants?.[0]?.stock ?? 0,
        sku: product.variants?.[0]?.sku ?? "",
        color: product.variants?.[0]?.color ?? "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
        brand: "",
        category: "",
        price: 0,
        stock: 0,
        sku: "",
        color: "",
      });
    }
    setPendingFiles([]);
    setPreviewUrls([]);
  }, [form, mode, product]);

  useEffect(() => {
    const nextPreviews = pendingFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(nextPreviews);
    return () => {
      nextPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [pendingFiles]);

  const existingImages = product?.images ?? [];

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setPendingFiles(files.slice(0, 5));
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);

    let imageUrls = product?.images ?? [];

    try {
      if (pendingFiles.length > 0) {
        const uploadResponse = await adminService.uploadProductImages(
          pendingFiles
        );
        imageUrls = [...imageUrls, ...(uploadResponse.data?.images ?? [])];
      }

      const payload = {
        name: values.name.trim(),
        description: cleanText(values.description),
        brand: cleanText(values.brand),
        categories: [values.category],
        status: product?.status ?? "active",
        variants: [
          {
            price: values.price,
            stock: values.stock,
            sku: cleanText(values.sku),
            color: cleanText(values.color),
          },
        ],
        images: imageUrls,
      };

      if (mode === "update" && product?._id) {
        await updateMutation.mutateAsync({
          productId: product._id,
          data: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      closeProductDrawer();
    } catch (error) {
      console.error(error);
      const httpError = error as HttpError;
      const detail = httpError?.details?.[0]?.message;
      const message = detail ?? httpError?.message ?? "Failed to save product.";
      notify.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!product?._id) return;

    try {
      await deleteMutation.mutateAsync(product._id);
      closeProductDrawer();
    } catch (error) {
      console.error(error);
    }
  };

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    isSaving;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => (!open ? closeProductDrawer() : null)}
    >
      <SheetContent
        side="right"
        className="w-full max-w-3xl overflow-y-auto p-8 lg:max-w-4xl"
      >
        <SheetHeader>
          <SheetTitle>
            {mode === "update" ? "Update product" : "Add new product"}
          </SheetTitle>
          <SheetDescription>
            {mode === "update"
              ? "Adjust pricing, inventory, or descriptions."
              : "Capture the essentials so this item is ready for launch."}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Galaxy S24 Ultra" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Why this variant matters"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl>
                        <Input placeholder="Samsung" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="SKU-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={
                        categoriesLoading || categoryOptions.length === 0
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {categoryOptions.length === 0 && !categoriesLoading && (
                      <p className="pt-2 text-sm text-muted-foreground">
                        No categories available. Seed categories on the server.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (USD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          value={
                            Number.isFinite(field.value) ? field.value : ""
                          }
                          onChange={(event) => {
                            const raw = event.target.value;
                            field.onChange(
                              raw === "" ? undefined : Number(raw)
                            );
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={
                            Number.isFinite(field.value) ? field.value : ""
                          }
                          onChange={(event) => {
                            const raw = event.target.value;
                            field.onChange(
                              raw === "" ? undefined : Number(raw)
                            );
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input placeholder="Midnight" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-3">
                <Label>Images</Label>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <p className="text-sm text-muted-foreground">
                  Up to 5 images · JPG, PNG, GIF, or WebP · 5 MB max each.
                </p>
                {existingImages.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {existingImages.map((src) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={src}
                        src={src}
                        alt="Product"
                        className="h-16 w-16 border object-cover"
                      />
                    ))}
                  </div>
                )}
                {previewUrls.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {previewUrls.map((url) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={url}
                        src={url}
                        alt="Preview"
                        className="h-16 w-16 border object-cover"
                      />
                    ))}
                  </div>
                )}
                {pendingFiles.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-sm text-muted-foreground"
                    onClick={() => setPendingFiles([])}
                  >
                    Clear selected images
                  </Button>
                )}
              </div>
              <SheetFooter className="flex w-full flex-col gap-2 pt-4 sm:flex-row sm:items-center sm:justify-between">
                {mode === "update" && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-red-500 hover:text-red-500"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                  >
                    <Trash className="mr-2 size-4" />
                    Delete
                  </Button>
                )}
                <Button type="submit" disabled={isSubmitting}>
                  {mode === "update" ? "Save changes" : "Create product"}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
