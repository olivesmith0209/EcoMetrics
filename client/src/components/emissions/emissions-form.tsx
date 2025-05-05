import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileUpload } from "@/components/ui/file-upload";
import { CalendarIcon } from "lucide-react";
import { EmissionFormData } from "@/types";
import { cn, formatDate } from "@/lib/utils";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmissionsFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: any;
}

export function EmissionsForm({ 
  onSuccess, 
  onCancel,
  initialData
}: EmissionsFormProps) {
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Fetch emission categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/emission-categories"],
  });
  
  // Form validation schema
  const formSchema = z.object({
    scope: z.string().min(1, { message: "Scope is required" }),
    categoryId: z.coerce.number().min(1, { message: "Category is required" }),
    description: z.string().min(3, { message: "Description must be at least 3 characters" }),
    amount: z.coerce.number().positive({ message: "Amount must be positive" }),
    date: z.date(),
    verified: z.boolean().default(false),
  });
  
  // Create form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      scope: "",
      categoryId: 0,
      description: "",
      amount: 0,
      date: new Date(),
      verified: false,
    },
  });
  
  // Set form values if initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        scope: initialData.scope,
        categoryId: initialData.categoryId,
        description: initialData.description,
        amount: initialData.amount,
        date: new Date(initialData.date),
        verified: initialData.verified,
      });
    }
  }, [initialData, form]);
  
  // Create or update emission
  const mutation = useMutation({
    mutationFn: async (values: EmissionFormData) => {
      // Create FormData object for file upload
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'date') {
          formData.append(key, value.toISOString());
        } else {
          formData.append(key, String(value));
        }
      });
      
      // Add file if exists
      if (uploadedFile) {
        formData.append('document', uploadedFile);
      }
      
      // Determine if this is an update or create
      if (initialData?.id) {
        const res = await fetch(`/api/emissions/${initialData.id}`, {
          method: 'PATCH',
          body: formData,
          credentials: 'include',
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || res.statusText);
        }
        
        return await res.json();
      } else {
        const res = await fetch('/api/emissions', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || res.statusText);
        }
        
        return await res.json();
      }
    },
    onSuccess: () => {
      // Clear form and invalidate queries
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/emissions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/emissions/summary'] });
      
      // Show success message
      toast({
        title: initialData ? "Emission updated" : "Emission created",
        description: initialData
          ? "The emission data has been updated successfully."
          : "The emission data has been saved successfully.",
      });
      
      // Call onSuccess callback
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }
  
  // Filter categories based on selected scope
  const filteredCategories = form.watch('scope') 
    ? categories.filter((cat: any) => cat.scope === form.watch('scope'))
    : [];
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="scope"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emission Scope</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select scope" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Scope 1">Scope 1</SelectItem>
                    <SelectItem value="Scope 2">Scope 2</SelectItem>
                    <SelectItem value="Scope 3">Scope 3</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  value={field.value?.toString() || ""}
                  disabled={!form.watch('scope')}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredCategories.map((category: any) => (
                      <SelectItem 
                        key={category.id} 
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="E.g., Office electricity consumption"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <div className="relative rounded-md shadow-sm">
                    <Input 
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      className="pr-16"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value === "" ? "0" : e.target.value;
                        field.onChange(parseFloat(value));
                      }}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-neutral-500 dark:text-neutral-400 sm:text-sm">
                        tCO<sub>2</sub>e
                      </span>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          formatDate(field.value)
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormItem>
          <FormLabel>Supporting Documentation</FormLabel>
          <FileUpload
            onFileSelect={(file) => setUploadedFile(file)}
            accept=".pdf,.png,.jpg,.jpeg,.gif"
          />
        </FormItem>
        
        <FormField
          control={form.control}
          name="verified"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Mark as verified</FormLabel>
                <FormDescription>
                  This indicates that the data has been verified by an authorized person.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <div className="mt-5 flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : initialData ? "Update Data" : "Save Data"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
