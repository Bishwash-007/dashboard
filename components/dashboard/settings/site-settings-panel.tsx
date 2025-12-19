"use client";

import { useEffect, useMemo } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import {
  resetSiteSettingsRequest,
  useSiteSettings,
  useSiteSettingsMutation,
} from "@/hooks/use-site-settings";
import type { SiteSettings, SiteSettingsPayload } from "@/types/api";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

const optionalEmail = z
  .string()
  .email({ message: "Enter a valid email" })
  .or(z.literal(""))
  .optional();

const optionalUrl = z
  .string()
  .url({ message: "Enter a valid URL" })
  .or(z.literal(""))
  .optional();

const contactSchema = z.object({
  email: optionalEmail,
  phone: z.string().max(40).optional(),
  supportHours: z.string().max(80).optional(),
  website: optionalUrl,
});

const addressSchema = z.object({
  line1: z.string().max(120).optional(),
  line2: z.string().max(120).optional(),
  city: z.string().max(80).optional(),
  state: z.string().max(80).optional(),
  postalCode: z.string().max(30).optional(),
  country: z.string().max(80).optional(),
});

const socialsSchema = z.object({
  facebook: optionalUrl,
  instagram: optionalUrl,
  twitter: optionalUrl,
  youtube: optionalUrl,
  linkedin: optionalUrl,
  tiktok: optionalUrl,
});

const policiesSchema = z.object({
  termsOfService: z.string().max(5_000).optional(),
  privacyPolicy: z.string().max(5_000).optional(),
  refundPolicy: z.string().max(5_000).optional(),
});

const paymentMethodSchema = z.object({
  name: z.string().min(2, { message: "Enter a name" }),
  description: z.string().max(200).optional(),
  instructions: z.string().max(400).optional(),
  enabled: z.boolean(),
});

const siteSettingsSchema = z.object({
  contact: contactSchema,
  address: addressSchema,
  socials: socialsSchema,
  policies: policiesSchema,
  paymentMethods: z.array(paymentMethodSchema).max(6),
});

type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>;

const socialPlatforms = [
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "twitter", label: "Twitter" },
  { key: "youtube", label: "YouTube" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "tiktok", label: "TikTok" },
] as const;

const defaultValues: SiteSettingsFormValues = {
  contact: {
    email: "",
    phone: "",
    supportHours: "",
    website: "",
  },
  address: {
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  },
  socials: socialPlatforms.reduce(
    (acc, platform) => ({ ...acc, [platform.key]: "" }),
    {} as SiteSettingsFormValues["socials"]
  ),
  policies: {
    termsOfService: "",
    privacyPolicy: "",
    refundPolicy: "",
  },
  paymentMethods: [],
};

const sanitizeString = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const pruneEmptyStrings = <T extends Record<string, string | undefined>>(
  record: T
): Partial<T> => {
  return Object.entries(record).reduce((acc, [key, value]) => {
    const sanitized = sanitizeString(value);
    if (sanitized !== undefined) {
      acc[key as keyof T] = sanitized as T[keyof T];
    }
    return acc;
  }, {} as Partial<T>);
};

const toFormValues = (
  settings?: SiteSettings | null
): SiteSettingsFormValues => ({
  contact: {
    email: settings?.contact?.email ?? "",
    phone: settings?.contact?.phone ?? "",
    supportHours: settings?.contact?.supportHours ?? "",
    website: settings?.contact?.website ?? "",
  },
  address: {
    line1: settings?.address?.line1 ?? "",
    line2: settings?.address?.line2 ?? "",
    city: settings?.address?.city ?? "",
    state: settings?.address?.state ?? "",
    postalCode: settings?.address?.postalCode ?? "",
    country: settings?.address?.country ?? "",
  },
  socials: socialPlatforms.reduce((acc, platform) => {
    return {
      ...acc,
      [platform.key]: settings?.socials?.[platform.key] ?? "",
    };
  }, {} as Record<(typeof socialPlatforms)[number]["key"], string>),
  policies: {
    termsOfService: settings?.policies?.termsOfService ?? "",
    privacyPolicy: settings?.policies?.privacyPolicy ?? "",
    refundPolicy: settings?.policies?.refundPolicy ?? "",
  },
  paymentMethods:
    settings?.paymentMethods?.map((method) => ({
      name: method.name,
      description: method.description ?? "",
      instructions: method.instructions ?? "",
      enabled: method.enabled ?? true,
    })) ?? [],
});

const buildPayload = (values: SiteSettingsFormValues): SiteSettingsPayload => {
  const filteredContact = pruneEmptyStrings(values.contact);
  const filteredAddress = pruneEmptyStrings(values.address);
  const filteredSocials = pruneEmptyStrings(values.socials);
  const filteredPolicies = pruneEmptyStrings(values.policies);

  const normalizedPaymentMethods = values.paymentMethods
    .map((method) => ({
      name: method.name.trim(),
      description: sanitizeString(method.description),
      instructions: sanitizeString(method.instructions),
      enabled: method.enabled,
    }))
    .filter((method) => method.name.length > 0);

  return {
    contact: Object.keys(filteredContact).length
      ? (filteredContact as SiteSettingsPayload["contact"])
      : undefined,
    address: Object.keys(filteredAddress).length
      ? (filteredAddress as SiteSettingsPayload["address"])
      : undefined,
    socials: Object.keys(filteredSocials).length
      ? (filteredSocials as SiteSettingsPayload["socials"])
      : undefined,
    policies: Object.keys(filteredPolicies).length
      ? (filteredPolicies as SiteSettingsPayload["policies"])
      : undefined,
    paymentMethods: normalizedPaymentMethods.length
      ? (normalizedPaymentMethods as SiteSettingsPayload["paymentMethods"])
      : undefined,
  };
};

export function SiteSettingsPanel() {
  const { data, isPending, isFetching, refetch } = useSiteSettings();
  const mutation = useSiteSettingsMutation();
  const settings = data?.data ?? null;

  const form = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(toFormValues(settings));
  }, [settings, form]);

  const {
    fields: paymentMethods,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: "paymentMethods",
  });

  const isInitialLoading = isPending && !settings;
  const isSaving = mutation.isPending;
  const updatedAt = settings?.updatedAt;
  const updatedBy = settings?.updatedBy;

  const lastUpdatedLabel = useMemo(() => {
    if (!updatedAt) {
      return null;
    }
    try {
      return new Date(updatedAt).toLocaleString();
    } catch {
      return updatedAt;
    }
  }, [updatedAt]);

  const updatedByLabel = useMemo(() => {
    if (!updatedBy) {
      return null;
    }
    if (typeof updatedBy === "string") {
      return updatedBy;
    }
    return updatedBy.name ?? updatedBy.email ?? null;
  }, [updatedBy]);

  const handleSubmit = async (values: SiteSettingsFormValues) => {
    const payload = buildPayload(values);
    try {
      await mutation.mutateAsync(payload);
    } catch {
      // handled via toast helpers
    }
  };

  const handleAddPaymentMethod = () =>
    append({
      name: "",
      description: "",
      instructions: "",
      enabled: true,
    });

  const handleReset = () => form.reset(toFormValues(settings));
  const handleSyncLatest = async () => {
    resetSiteSettingsRequest();
    await refetch();
  };

  if (isInitialLoading) {
    return (
      <section className="space-y-6">
        <Card className="border border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle>Loading site settings</CardTitle>
            <CardDescription>
              Fetching the latest storefront configuration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="flex flex-col gap-3 rounded-md border border-border/60 bg-muted/40 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                {lastUpdatedLabel
                  ? `Last updated ${lastUpdatedLabel}`
                  : "Not configured yet"}
              </p>
              {updatedByLabel ? (
                <p className="text-sm text-muted-foreground">
                  Updated by {updatedByLabel}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSyncLatest}
                disabled={isFetching || isSaving}
              >
                {isFetching ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 size-4" />
                )}
                Sync latest
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
                disabled={isSaving}
              >
                Reset form
              </Button>
            </div>
          </div>

          <fieldset disabled={isSaving} className="space-y-6">
            <Card className="border border-border/60 bg-card/80 shadow-black/5">
              <CardHeader>
                <CardTitle>Support & Contact</CardTitle>
                <CardDescription>
                  Keep your frontline contact details accurate so shoppers know
                  how to reach you.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="contact.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Support email</FormLabel>
                      <FormControl>
                        <Input placeholder="help@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hotline</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (800) 555-1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact.supportHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Support hours</FormLabel>
                      <FormControl>
                        <Input placeholder="24/7" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact.website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://storefront.example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border border-border/60 bg-card/80 shadow-black/5">
              <CardHeader>
                <CardTitle>HQ Address</CardTitle>
                <CardDescription>
                  Display where your retail or fulfillment teams operate from.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="address.line1"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address line 1</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Commerce Way" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.line2"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address line 2</FormLabel>
                      <FormControl>
                        <Input placeholder="Suite 400" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Metropolis" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State / Province</FormLabel>
                      <FormControl>
                        <Input placeholder="CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal code</FormLabel>
                      <FormControl>
                        <Input placeholder="94016" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="United States" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border border-border/60 bg-card/80 shadow-black/5">
              <CardHeader>
                <CardTitle>Social Profiles</CardTitle>
                <CardDescription>
                  Link the platforms where customers already follow your brand.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {socialPlatforms.map((platform) => (
                  <FormField
                    key={platform.key}
                    control={form.control}
                    name={`socials.${platform.key}` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{platform.label}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={`https://${platform.key}.com/brand`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </CardContent>
            </Card>

            <Card className="border border-border/60 bg-card/80 shadow-black/5">
              <CardHeader>
                <CardTitle>Policy Pages</CardTitle>
                <CardDescription>
                  Keep terms, privacy, and refund commitments transparent for
                  shoppers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="policies.termsOfService"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terms of Service</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="All sales final..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="policies.privacyPolicy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Privacy Policy</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="We respect your privacy..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="policies.refundPolicy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Refund Policy</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Refunds are processed within 5 business days..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border border-border/60 bg-card/80 shadow-black/5">
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Outline each payment option with instructions customers
                    should follow at checkout.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddPaymentMethod}
                  disabled={paymentMethods.length >= 6}
                >
                  <Plus className="mr-2 size-4" />
                  Add method
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.length === 0 ? (
                  <p className="rounded-md border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                    No payment methods added yet. Start by specifying at least
                    one accepted method.
                  </p>
                ) : null}
                {paymentMethods.map((field, index) => (
                  <div
                    key={field.id}
                    className="space-y-4 rounded-md border border-border/80 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-muted-foreground">
                        Method #{index + 1}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="mr-1 size-4" />
                        Remove
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`paymentMethods.${index}.name`}
                        render={({ field: methodField }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Display name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Credit Card"
                                {...methodField}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`paymentMethods.${index}.description`}
                        render={({ field: methodField }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="VISA, MasterCard, AMEX"
                                {...methodField}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`paymentMethods.${index}.instructions`}
                        render={({ field: methodField }) => (
                          <FormItem>
                            <FormLabel>Instructions</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Pay securely online"
                                {...methodField}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name={`paymentMethods.${index}.enabled`}
                      render={({ field: methodField }) => (
                        <FormItem className="flex items-center gap-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={methodField.value}
                              onCheckedChange={methodField.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm">
                            Visible in checkout
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </fieldset>

          <div className="flex flex-col gap-3 border-t border-border/60 pt-4 md:flex-row md:items-center md:justify-end">
            <Button
              type="submit"
              size="lg"
              className="min-w-48"
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Saving changes
                </span>
              ) : (
                "Save settings"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
