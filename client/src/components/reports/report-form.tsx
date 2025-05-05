import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ReportFormProps {
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReportForm({
  initialData,
  onSuccess,
  onCancel
}: ReportFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    initialData ? {
      from: initialData.startDate ? new Date(initialData.startDate) : undefined,
      to: initialData.endDate ? new Date(initialData.endDate) : undefined,
    } : undefined
  );
  
  // Form validation schema
  const formSchema = z.object({
    name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
    description: z.string().optional(),
    type: z.string().min(1, { message: 'Please select a report type' }),
  }).refine(data => !!dateRange?.from && !!dateRange?.to, {
    message: 'Please select a date range',
    path: ['dateRange'],
  });
  
  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || (initialData?.template ? initialData.template.name : ''),
      description: initialData?.description || (initialData?.template ? initialData.template.description : ''),
      type: initialData?.type || (initialData?.template ? initialData.template.type : ''),
    },
  });
  
  // Create report mutation
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!dateRange?.from || !dateRange?.to) {
        throw new Error('Date range is required');
      }
      
      const data = {
        ...values,
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
        status: 'draft',
        createdBy: user!.id,
      };
      
      if (initialData?.id) {
        // Update existing report
        const res = await apiRequest('PATCH', `/api/reports/${initialData.id}`, data);
        return res.json();
      } else {
        // Create new report
        const res = await apiRequest('POST', '/api/reports', data);
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      toast({
        title: initialData?.id ? 'Report updated' : 'Report created',
        description: initialData?.id
          ? 'The report has been updated successfully.'
          : 'The report has been created successfully.',
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Handle form submission
  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Report Name</FormLabel>
              <FormControl>
                <Input placeholder="Annual Carbon Emissions 2023" {...field} />
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
                  placeholder="A detailed report of our carbon emissions for compliance purposes"
                  className="resize-none h-20"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Report Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="annual">Annual Report</SelectItem>
                  <SelectItem value="quarterly">Quarterly Report</SelectItem>
                  <SelectItem value="monthly">Monthly Report</SelectItem>
                  <SelectItem value="compliance">Compliance Report</SelectItem>
                  <SelectItem value="custom">Custom Report</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <FormLabel>Date Range</FormLabel>
          <DateRangePicker 
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            className="w-full"
          />
          {form.formState.errors.dateRange && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.dateRange.message}
            </p>
          )}
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
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
            {mutation.isPending
              ? 'Saving...'
              : initialData?.id
              ? 'Update Report'
              : 'Create Report'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
