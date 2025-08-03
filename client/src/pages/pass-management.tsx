import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { createPassesSchema, type CreatePassesData, type PassData, type Pass } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Minus, Upload, DollarSign, Clock, User, FileText, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";

const PASS_TYPES = [
  { value: "daily", label: "Daily Pass", price: "6.11" },
  { value: "vehicle", label: "Vehicle Sticker", price: "11.21" },
  { value: "crane", label: "Crane Lorry Vehicle Sticker Pass", price: "81.51" },
  { value: "trailer20", label: "Trailer 20/Dump Truck Vehicle Sticker", price: "15.75" },
  { value: "trailer40", label: "Trailer 40 Vehicle Sticker", price: "25.50" },
];

export default function PassManagement() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch pass prices
  const { data: passPrices } = useQuery({
    queryKey: ["/api/pass-prices"],
  });

  // Fetch recent passes
  const { data: recentPasses } = useQuery({
    queryKey: ["/api/passes/recent"],
  });

  const form = useForm<CreatePassesData>({
    resolver: zodResolver(createPassesSchema),
    defaultValues: {
      payer: {
        name: "",
        email: "",
        phone: "",
      },
      passes: [
        {
          customerName: "",
          passType: "daily",
          idNumber: "",
          plateNumber: "",
          validDate: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "passes",
  });

  const createPassesMutation = useMutation({
    mutationFn: async (data: { formData: CreatePassesData; file: File }) => {
      const formData = new FormData();
      formData.append("data", JSON.stringify(data.formData));
      formData.append("slip", data.file);

      const res = await fetch("/api/passes", {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create passes");
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Passes Created Successfully",
        description: `Created ${data.passes.length} pass(es) for transaction ${data.transaction.id}`,
      });
      form.reset();
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ["/api/passes/recent"] });
      // Navigate to the pass display page
      setLocation(`/pass/${data.transaction.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Passes",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreatePassesData) => {
    if (!selectedFile) {
      toast({
        title: "Bank Transfer Slip Required",
        description: "Please upload a bank transfer slip",
        variant: "destructive",
      });
      return;
    }

    createPassesMutation.mutate({ formData: data, file: selectedFile });
  };

  const calculateTotal = () => {
    if (!passPrices) return 0;
    return form.watch("passes").reduce((total, pass) => {
      return total + parseFloat(passPrices[pass.passType] || "0");
    }, 0);
  };

  const formatCurrency = (amount: number) => `MVR ${amount.toFixed(2)}`;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Pass Management System
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create and manage digital port passes and vehicle stickers
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Create New Passes</CardTitle>
              <CardDescription>
                Fill in the payer information and pass details to generate new passes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Payer Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Payer Information
                  </h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="payerName">Payer Name *</Label>
                      <Input
                        id="payerName"
                        placeholder="Enter payer's full name"
                        {...form.register("payer.name")}
                      />
                      {form.formState.errors.payer?.name && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.payer.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payerEmail">Email (Optional)</Label>
                      <Input
                        id="payerEmail"
                        type="email"
                        placeholder="payer@example.com"
                        {...form.register("payer.email")}
                      />
                      {form.formState.errors.payer?.email && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.payer.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="payerPhone">Phone (Optional)</Label>
                      <Input
                        id="payerPhone"
                        placeholder="+960 123-4567"
                        {...form.register("payer.phone")}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Pass Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Pass Details
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({
                        customerName: "",
                        passType: "daily",
                        idNumber: "",
                        plateNumber: "",
                        validDate: "",
                      })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Pass
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <Card key={field.id} className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">Pass #{index + 1}</h4>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Customer Name *</Label>
                            <Input
                              placeholder="Enter customer name"
                              {...form.register(`passes.${index}.customerName`)}
                            />
                            {form.formState.errors.passes?.[index]?.customerName && (
                              <p className="text-sm text-red-600">
                                {form.formState.errors.passes[index]?.customerName?.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Pass Type *</Label>
                            <Select
                              value={form.watch(`passes.${index}.passType`)}
                              onValueChange={(value) => form.setValue(`passes.${index}.passType`, value as any)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select pass type" />
                              </SelectTrigger>
                              <SelectContent>
                                {PASS_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label} - MVR {type.price}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {form.watch(`passes.${index}.passType`) === "daily" && (
                            <div className="space-y-2">
                              <Label>ID Card Number *</Label>
                              <Input
                                placeholder="Enter ID card number"
                                {...form.register(`passes.${index}.idNumber`)}
                              />
                              {form.formState.errors.passes?.[index]?.idNumber && (
                                <p className="text-sm text-red-600">
                                  {form.formState.errors.passes[index]?.idNumber?.message}
                                </p>
                              )}
                            </div>
                          )}

                          {(form.watch(`passes.${index}.passType`) === "vehicle" || 
                            form.watch(`passes.${index}.passType`) === "crane" ||
                            form.watch(`passes.${index}.passType`) === "trailer20" ||
                            form.watch(`passes.${index}.passType`) === "trailer40") && (
                            <div className="space-y-2">
                              <Label>Vehicle Plate Number *</Label>
                              <Input
                                placeholder="Enter plate number"
                                {...form.register(`passes.${index}.plateNumber`)}
                              />
                              {form.formState.errors.passes?.[index]?.plateNumber && (
                                <p className="text-sm text-red-600">
                                  {form.formState.errors.passes[index]?.plateNumber?.message}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label>Valid Date *</Label>
                            <Input
                              type="date"
                              {...form.register(`passes.${index}.validDate`)}
                            />
                            {form.formState.errors.passes?.[index]?.validDate && (
                              <p className="text-sm text-red-600">
                                {form.formState.errors.passes[index]?.validDate?.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Bank Transfer Slip Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Bank Transfer Slip
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="slip">Upload Payment Slip *</Label>
                    <Input
                      id="slip"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setSelectedFile(file || null);
                      }}
                    />
                    <p className="text-sm text-gray-600">
                      Accepted formats: JPG, PNG, PDF (Max 5MB)
                    </p>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold flex items-center gap-2">
                      Total Amount:
                    </span>
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      MVR {calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createPassesMutation.isPending}
                >
                  {createPassesMutation.isPending ? "Creating Passes..." : "Create Passes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Recent Passes Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Passes
              </CardTitle>
              <CardDescription>
                Recently created passes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentPasses && recentPasses.length > 0 ? (
                <div className="space-y-3">
                  {recentPasses.map((pass: Pass) => (
                    <div key={pass.id} className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" 
                         onClick={() => navigate(`/pass/${pass.transactionId}`)}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{pass.customerName}</span>
                        <Badge variant="secondary" className="text-xs">
                          {PASS_TYPES.find(t => t.value === pass.passType)?.label || pass.passType}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <p>Pass: {pass.passNumber}</p>
                        <p>Valid: {pass.validDate}</p>
                        <p className="font-medium">MVR {pass.amount}</p>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => navigate('/reports')}
                  >
                    View All Reports
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                  No recent passes found
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}