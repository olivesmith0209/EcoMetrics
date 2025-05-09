import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useLanguage, Language } from "@/hooks/use-language";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Camera, User, Building2, CreditCard, Shield, Languages, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState("profile");

  // Fetch company data if user has a company
  const { data: company, isLoading: isLoadingCompany } = useQuery({
    queryKey: ["/api/company"],
    queryFn: async () => {
      const res = await fetch("/api/company");
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch company");
      }
      return res.json();
    },
    enabled: !!user?.companyId,
  });

  // Fetch subscription data
  const { data: subscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ["/api/subscription"],
    queryFn: async () => {
      const res = await fetch("/api/subscription");
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch subscription");
      }
      return res.json();
    },
    enabled: !!user?.companyId,
  });

  // User profile form schema
  const profileFormSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email("Please enter a valid email").min(1, "Email is required"),
    language: z.string().min(1, "Language is required"),
  });
  
  // Password change form schema
  const passwordFormSchema = z.object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  // Company form schema
  const companyFormSchema = z.object({
    name: z.string().min(2, "Company name must be at least 2 characters"),
    industry: z.string().optional(),
    size: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
  });

  // User profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      language: user?.language || "en",
    },
  });

  // Company form
  const companyForm = useForm<z.infer<typeof companyFormSchema>>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: company?.name || "",
      industry: company?.industry || "",
      size: company?.size || "",
      address: company?.address || "",
      city: company?.city || "",
      country: company?.country || "",
    },
  });

  // Update company form when data is loaded
  useEffect(() => {
    if (company) {
      companyForm.reset({
        name: company.name || "",
        industry: company.industry || "",
        size: company.size || "",
        address: company.address || "",
        city: company.city || "",
        country: company.country || "",
      });
    }
  }, [company, companyForm]);

  // Avatar upload mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      // Instead of using Supabase storage directly, let's use our backend as a proxy
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('avatar', file);
      
      // Upload the file through our API
      const res = await fetch(`/api/user/${user?.id}/avatar`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Failed to upload avatar: ${res.status}`);
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update avatar",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handler for avatar file upload
  const handleAvatarUpload = (file: File) => {
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 2MB.",
        variant: "destructive",
      });
      return;
    }
    
    // Upload the file
    uploadAvatarMutation.mutate(file);
  };

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileFormSchema>) => {
      const res = await apiRequest("PATCH", `/user/${user?.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update/Create company mutation
  const companyMutation = useMutation({
    mutationFn: async (data: z.infer<typeof companyFormSchema>) => {
      if (company) {
        // Update existing company
        const res = await apiRequest("PATCH", `/company/${company.id}`, data);
        return res.json();
      } else {
        // Create new company
        const res = await apiRequest("POST", "/company", data);
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company"] });
      toast({
        title: company ? "Company updated" : "Company created",
        description: company
          ? "Your company information has been updated."
          : "Your company has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save company information",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle profile form submission
  const onProfileSubmit = (values: z.infer<typeof profileFormSchema>) => {
    // Update the language in our context
    if (values.language && values.language !== language) {
      setLanguage(values.language as Language);
    }
    
    // Update the profile in the database
    updateProfileMutation.mutate(values);
  };

  // Handle company form submission
  const onCompanySubmit = (values: z.infer<typeof companyFormSchema>) => {
    companyMutation.mutate(values);
  };
  
  // Password form
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof passwordFormSchema>) => {
      const { currentPassword, newPassword } = data;
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { success: true };
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update password",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle password form submission
  const onPasswordSubmit = (values: z.infer<typeof passwordFormSchema>) => {
    changePasswordMutation.mutate(values);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">{t('profile.title')}</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            {t('profile.subtitle')}
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{t('profile.tabs.profile')}</span>
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>{t('profile.tabs.company')}</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>{t('profile.tabs.subscription')}</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>{t('profile.tabs.security')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.profileInfo')}</CardTitle>
                <CardDescription>
                  {t('profile.profileDesc')}
                </CardDescription>
              </CardHeader>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                  <CardContent className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary h-16 w-16 rounded-full flex items-center justify-center text-white font-medium text-xl overflow-hidden">
                        {user?.avatarUrl ? (
                          <img 
                            src={user.avatarUrl} 
                            alt="User avatar" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user?.firstName && user?.lastName
                            ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                            : user?.email ? user.email.substring(0, 2).toUpperCase() : "U"
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">Profile Picture</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          JPG, PNG or GIF, max 2MB
                        </p>
                        <div className="mt-2">
                          <input
                            type="file"
                            accept="image/*"
                            id="avatar-upload"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleAvatarUpload(file);
                              }
                            }}
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => document.getElementById('avatar-upload')?.click()}
                            disabled={uploadAvatarMutation.isPending}
                          >
                            {uploadAvatarMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Camera className="h-4 w-4 mr-2" />
                                Change Avatar
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* User Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('profile.firstName')}</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('profile.lastName')}</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('profile.email')}</FormLabel>
                          <FormControl>
                            <Input placeholder="john.doe@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('profile.language')}</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Set language immediately on change
                              setLanguage(value as Language);
                            }}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="de">Deutsch</SelectItem>
                              <SelectItem value="fr">Français</SelectItem>
                              <SelectItem value="es">Español</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending
                        ? t('profile.saving')
                        : t('profile.saveChanges')}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>

          {/* Company Tab */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  {company
                    ? "Update your company details"
                    : "Add your company information to enable all features"}
                </CardDescription>
              </CardHeader>
              <Form {...companyForm}>
                <form onSubmit={companyForm.handleSubmit(onCompanySubmit)}>
                  <CardContent className="space-y-4">
                    {isLoadingCompany ? (
                      <>
                        <Skeleton className="h-10 w-full" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </>
                    ) : (
                      <>
                        <FormField
                          control={companyForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Acme Corporation" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={companyForm.control}
                            name="industry"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Industry</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value || ""}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select industry" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="technology">Technology</SelectItem>
                                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                                    <SelectItem value="retail">Retail</SelectItem>
                                    <SelectItem value="healthcare">Healthcare</SelectItem>
                                    <SelectItem value="finance">Finance</SelectItem>
                                    <SelectItem value="education">Education</SelectItem>
                                    <SelectItem value="energy">Energy</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={companyForm.control}
                            name="size"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Size</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value || ""}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select company size" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="1-10">1-10 employees</SelectItem>
                                    <SelectItem value="11-50">11-50 employees</SelectItem>
                                    <SelectItem value="51-200">51-200 employees</SelectItem>
                                    <SelectItem value="201-500">201-500 employees</SelectItem>
                                    <SelectItem value="501-1000">501-1000 employees</SelectItem>
                                    <SelectItem value="1000+">1000+ employees</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={companyForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="123 Main St" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={companyForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="New York" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={companyForm.control}
                            name="country"
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
                        </div>
                      </>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      disabled={isLoadingCompany || companyMutation.isPending}
                    >
                      {companyMutation.isPending
                        ? "Saving..."
                        : company ? "Update Company" : "Create Company"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>
                  View and manage your subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoadingSubscription ? (
                  <>
                    <Skeleton className="h-32 w-full rounded-md" />
                    <Skeleton className="h-24 w-full rounded-md" />
                  </>
                ) : subscription ? (
                  <>
                    <div className="bg-primary/5 p-6 rounded-md">
                      <h3 className="text-lg font-medium">Current Plan</h3>
                      <div className="flex justify-between items-center mt-4">
                        <div>
                          <p className="text-2xl font-bold">{subscription.plan.name}</p>
                          <p className="text-neutral-600 dark:text-neutral-400">
                            Renews on {new Date(subscription.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <Button variant="outline">Manage Plan</Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">
                            {subscription.currentUsers} / {subscription.maxUsers}
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Storage</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">
                            {subscription.storageUsed} / {subscription.storageLimit}
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Reports</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">
                            {subscription.reportsUsed} / {subscription.reportsLimit}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-2">Payment Method</h3>
                      <div className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-2" />
                        <span>
                          •••• •••• •••• {subscription.lastFourDigits || "1234"}
                        </span>
                        <Button variant="ghost" size="sm" className="ml-auto">
                          Update
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <CreditCard className="h-12 w-12 mb-4 text-neutral-400" />
                    <h3 className="text-lg font-medium">No Subscription Found</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-center mt-1 mb-4">
                      You need to create a company before you can manage subscriptions.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("company")}
                      disabled={!user}
                    >
                      Set Up Company First
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>
                  Manage your password and security settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                    >
                      {changePasswordMutation.isPending
                        ? "Changing Password..."
                        : "Change Password"}
                    </Button>
                  </form>
                </Form>
                
                <Separator className="my-8" />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </p>
                  <Button variant="outline">
                    Enable 2FA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}