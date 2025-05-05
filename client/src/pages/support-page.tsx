import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Check, Clock, Plus, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";

// Form validation schema for creating a ticket
const ticketFormSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  priority: z.string().min(1, "Please select a priority"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Form validation schema for sending a message
const messageFormSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

// Type for support ticket statuses
type TicketStatus = "open" | "closed" | "all";

export default function SupportPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [status, setStatus] = useState<TicketStatus>("all");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [newTicketDialogOpen, setNewTicketDialogOpen] = useState(false);

  // Form for new ticket
  const ticketForm = useForm<z.infer<typeof ticketFormSchema>>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      subject: "",
      categoryId: "",
      priority: "medium",
      message: "",
    },
  });

  // Form for sending messages
  const messageForm = useForm<z.infer<typeof messageFormSchema>>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      message: "",
    },
  });

  // Query for support categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/support/categories"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Query for support tickets
  const ticketsQuery = useQuery({
    queryKey: ["/api/support/tickets", status],
    queryFn: async () => {
      const url = status === "all" 
        ? "/api/support/tickets" 
        : `/api/support/tickets?status=${status}`;
      const res = await apiRequest("GET", url);
      return res.json();
    }
  });

  // Query for selected ticket details
  const ticketDetailsQuery = useQuery({
    queryKey: ["/api/support/tickets", selectedTicketId],
    queryFn: async () => {
      if (!selectedTicketId) return null;
      const res = await apiRequest("GET", `/api/support/tickets/${selectedTicketId}`);
      return res.json();
    },
    enabled: !!selectedTicketId,
  });

  // Mutation for creating a new ticket
  const createTicketMutation = useMutation({
    mutationFn: async (data: z.infer<typeof ticketFormSchema>) => {
      const res = await apiRequest("POST", "/api/support/tickets", {
        subject: data.subject,
        categoryId: parseInt(data.categoryId),
        priority: data.priority,
        message: data.message,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets"] });
      ticketForm.reset();
      setNewTicketDialogOpen(false);
      toast({
        title: "Success",
        description: "Your support ticket has been created.",
      });
    },
    onError: (error) => {
      console.error("Error creating ticket:", error);
      toast({
        title: "Error",
        description: "Failed to create support ticket. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for sending a new message
  const sendMessageMutation = useMutation({
    mutationFn: async (data: z.infer<typeof messageFormSchema>) => {
      if (!selectedTicketId) throw new Error("No ticket selected");
      const res = await apiRequest("POST", `/api/support/tickets/${selectedTicketId}/messages`, {
        message: data.message,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets", selectedTicketId] });
      messageForm.reset();
      toast({
        title: "Success",
        description: "Your message has been sent.",
      });
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for closing a ticket
  const closeTicketMutation = useMutation({
    mutationFn: async (ticketId: number) => {
      const res = await apiRequest("PATCH", `/api/support/tickets/${ticketId}`, {
        status: "closed",
        closedAt: new Date().toISOString(),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets", selectedTicketId] });
      toast({
        title: "Success",
        description: "Your ticket has been closed.",
      });
    },
    onError: (error) => {
      console.error("Error closing ticket:", error);
      toast({
        title: "Error",
        description: "Failed to close ticket. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for reopening a ticket
  const reopenTicketMutation = useMutation({
    mutationFn: async (ticketId: number) => {
      const res = await apiRequest("PATCH", `/api/support/tickets/${ticketId}`, {
        status: "open",
        closedAt: null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets", selectedTicketId] });
      toast({
        title: "Success",
        description: "Your ticket has been reopened.",
      });
    },
    onError: (error) => {
      console.error("Error reopening ticket:", error);
      toast({
        title: "Error",
        description: "Failed to reopen ticket. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handler for submitting a new ticket
  const onCreateTicket = (data: z.infer<typeof ticketFormSchema>) => {
    createTicketMutation.mutate(data);
  };

  // Handler for sending a message
  const onSendMessage = (data: z.infer<typeof messageFormSchema>) => {
    sendMessageMutation.mutate(data);
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Clock className="mr-1 h-3 w-3" /> Open
        </Badge>;
      case "closed":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          <Check className="mr-1 h-3 w-3" /> Closed
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get priority badge styling
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>;
      case "low":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  // Format date for display
  const formatTicketDate = (date: string) => {
    return formatDate(date, "MMM d, yyyy 'at' h:mm a");
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Support Center</h1>
        <Dialog open={newTicketDialogOpen} onOpenChange={setNewTicketDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create a Support Ticket</DialogTitle>
              <DialogDescription>
                Provide details about your issue and we'll get back to you as soon as possible.
              </DialogDescription>
            </DialogHeader>
            <Form {...ticketForm}>
              <form onSubmit={ticketForm.handleSubmit(onCreateTicket)} className="space-y-4">
                <FormField
                  control={ticketForm.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description of your issue" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={ticketForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(categories) && categories.map((category: any) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={ticketForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={ticketForm.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your issue in detail" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createTicketMutation.isPending}
                  >
                    {createTicketMutation.isPending ? "Creating..." : "Create Ticket"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tickets" className="space-y-4">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="md:w-1/3">
              <Card>
                <CardHeader>
                  <CardTitle>Support Tickets</CardTitle>
                  <CardDescription>
                    View and manage your support requests
                  </CardDescription>
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      variant={status === "all" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setStatus("all")}
                    >
                      All
                    </Button>
                    <Button 
                      variant={status === "open" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setStatus("open")}
                    >
                      Open
                    </Button>
                    <Button 
                      variant={status === "closed" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setStatus("closed")}
                    >
                      Closed
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {ticketsQuery.isLoading ? (
                    <div className="text-center py-4">Loading tickets...</div>
                  ) : ticketsQuery.data?.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No tickets found
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {ticketsQuery.data?.map((ticket: any) => (
                          <div 
                            key={ticket.id}
                            className={`p-3 border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground ${selectedTicketId === ticket.id ? 'bg-accent text-accent-foreground' : ''}`}
                            onClick={() => setSelectedTicketId(ticket.id)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="font-medium truncate mr-2" title={ticket.subject}>
                                {ticket.subject}
                              </div>
                              {getStatusBadge(ticket.status)}
                            </div>
                            <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                              <div>#{ticket.id}</div>
                              <div>{formatDate(ticket.createdAt, "MMM d, yyyy")}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="md:w-2/3">
              {selectedTicketId ? (
                ticketDetailsQuery.isLoading ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">Loading ticket details...</div>
                    </CardContent>
                  </Card>
                ) : ticketDetailsQuery.data ? (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{ticketDetailsQuery.data.subject}</CardTitle>
                          <CardDescription>Ticket #{ticketDetailsQuery.data.id}</CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          {getPriorityBadge(ticketDetailsQuery.data.priority)}
                          {getStatusBadge(ticketDetailsQuery.data.status)}
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 text-sm text-muted-foreground">
                        <div>Created: {formatTicketDate(ticketDetailsQuery.data.createdAt)}</div>
                        {ticketDetailsQuery.data.status === "open" ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => closeTicketMutation.mutate(ticketDetailsQuery.data.id)}
                            disabled={closeTicketMutation.isPending}
                          >
                            <X className="mr-1 h-4 w-4" /> Close Ticket
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => reopenTicketMutation.mutate(ticketDetailsQuery.data.id)}
                            disabled={reopenTicketMutation.isPending}
                          >
                            <Clock className="mr-1 h-4 w-4" /> Reopen Ticket
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-4">
                      <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-4">
                          {ticketDetailsQuery.data.messages?.map((message: any) => (
                            <div key={message.id} className="flex flex-col">
                              <div className={`flex items-start space-x-2 ${message.isStaff ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[80%] rounded-lg p-3 ${message.isStaff ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground'}`}>
                                  <div className="text-sm font-medium mb-1">
                                    {message.isStaff ? 'Support Team' : user?.username || 'You'}
                                  </div>
                                  <div className="whitespace-pre-wrap break-words">
                                    {message.message}
                                  </div>
                                  <div className="text-xs mt-1 opacity-70">
                                    {formatTicketDate(message.createdAt)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                    <CardFooter>
                      {ticketDetailsQuery.data.status === "open" ? (
                        <Form {...messageForm}>
                          <form 
                            onSubmit={messageForm.handleSubmit(onSendMessage)} 
                            className="w-full space-y-2"
                          >
                            <FormField
                              control={messageForm.control}
                              name="message"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <div className="flex space-x-2">
                                      <Textarea 
                                        placeholder="Type your message..." 
                                        className="flex-1"
                                        {...field}
                                      />
                                      <Button 
                                        type="submit" 
                                        disabled={sendMessageMutation.isPending}
                                      >
                                        <Send className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </form>
                        </Form>
                      ) : (
                        <div className="w-full text-center text-muted-foreground">
                          This ticket is closed. Reopen it to send messages.
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">Failed to load ticket details</div>
                    </CardContent>
                  </Card>
                )
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8 text-muted-foreground">
                      Select a ticket to view details or create a new ticket
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="knowledge">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
              <CardDescription>
                Browse articles and answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(categories) && categories.map((category: any) => (
                  <Card key={category.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {category.description || "Browse articles about this topic"}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button variant="outline" className="w-full">View Articles</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}