import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { createStaffSchema, type CreateStaffData, type Staff } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Shield, Users, Plus, Calendar, CheckCircle, XCircle, Eye, EyeOff, Edit, Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all staff
  const { data: staffList, isLoading } = useQuery<Staff[]>({
    queryKey: ["/api/admin/staff"],
  });

  // Create staff form
  const form = useForm<CreateStaffData>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      designation: "",
      department: "",
      isAdmin: false,
    },
  });

  // Create staff mutation
  const createStaffMutation = useMutation({
    mutationFn: async (data: CreateStaffData) => {
      const res = await apiRequest("POST", "/api/admin/staff", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Staff Member Created",
        description: "New staff member has been successfully added to the system.",
      });
      form.reset();
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/staff"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Staff",
        description: error.message || "Failed to create staff member",
        variant: "destructive",
      });
    },
  });

  // Edit staff mutation
  const editStaffMutation = useMutation({
    mutationFn: async (data: { id: string; updateData: Partial<Staff> }) => {
      const res = await apiRequest("PUT", `/api/admin/staff/${data.id}`, data.updateData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Staff Member Updated",
        description: "Staff member has been successfully updated.",
      });
      setIsEditDialogOpen(false);
      setEditingStaff(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/staff"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error Updating Staff",
        description: error.message || "Failed to update staff member",
        variant: "destructive",
      });
    },
  });

  // Delete staff mutation
  const deleteStaffMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/staff/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Staff Member Deleted",
        description: "Staff member has been successfully removed from the system.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/staff"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Staff",
        description: error.message || "Failed to delete staff member",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateStaffData) => {
    createStaffMutation.mutate(data);
  };

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this staff member? This action cannot be undone.")) {
      deleteStaffMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Shield className="h-8 w-8" />
          Administration Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage staff members and system administration
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Staff
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {staffList?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Staff
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {staffList?.filter((staff: Staff) => staff.isActive).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Administrators
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {staffList?.filter((staff: Staff) => staff.isAdmin).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Staff Management
              </CardTitle>
              <CardDescription>
                Manage staff members and their permissions
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Staff Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Staff Member</DialogTitle>
                  <DialogDescription>
                    Add a new staff member to the system with appropriate permissions.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username *</Label>
                      <Input
                        id="username"
                        placeholder="Enter username"
                        {...form.register("username")}
                        disabled={createStaffMutation.isPending}
                      />
                      {form.formState.errors.username && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.username.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          {...form.register("password")}
                          disabled={createStaffMutation.isPending}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={createStaffMutation.isPending}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {form.formState.errors.password && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="Enter full name"
                      {...form.register("fullName")}
                      disabled={createStaffMutation.isPending}
                    />
                    {form.formState.errors.fullName && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="designation">Designation *</Label>
                      <Input
                        id="designation"
                        placeholder="e.g., Port Officer"
                        {...form.register("designation")}
                        disabled={createStaffMutation.isPending}
                      />
                      {form.formState.errors.designation && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.designation.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department">Department *</Label>
                      <Input
                        id="department"
                        placeholder="e.g., Operations"
                        {...form.register("department")}
                        disabled={createStaffMutation.isPending}
                      />
                      {form.formState.errors.department && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.department.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isAdmin"
                      checked={form.watch("isAdmin")}
                      onCheckedChange={(checked) => form.setValue("isAdmin", checked)}
                      disabled={createStaffMutation.isPending}
                    />
                    <Label htmlFor="isAdmin">Administrator privileges</Label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      disabled={createStaffMutation.isPending}
                      className="flex-1"
                    >
                      {createStaffMutation.isPending ? "Creating..." : "Create Staff Member"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      disabled={createStaffMutation.isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Edit Staff Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Staff Member</DialogTitle>
                  <DialogDescription>
                    Update staff member information and permissions.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (editingStaff) {
                    const formData = new FormData(e.target as HTMLFormElement);
                    const updateData = {
                      fullName: formData.get('fullName') as string,
                      designation: formData.get('designation') as string,
                      department: formData.get('department') as string,
                      isAdmin: formData.get('isAdmin') === 'on',
                      isActive: formData.get('isActive') === 'on',
                    };
                    editStaffMutation.mutate({ id: editingStaff.id, updateData });
                  }
                }} className="space-y-4">
                  {editingStaff && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="editFullName">Full Name</Label>
                        <Input
                          id="editFullName"
                          name="fullName"
                          defaultValue={editingStaff.fullName}
                          placeholder="Enter full name"
                          disabled={editStaffMutation.isPending}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="editDesignation">Designation</Label>
                        <Input
                          id="editDesignation"
                          name="designation"
                          defaultValue={editingStaff.designation}
                          placeholder="Enter designation"
                          disabled={editStaffMutation.isPending}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="editDepartment">Department</Label>
                        <Input
                          id="editDepartment"
                          name="department"
                          defaultValue={editingStaff.department}
                          placeholder="Enter department"
                          disabled={editStaffMutation.isPending}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="editIsActive"
                          name="isActive"
                          defaultChecked={editingStaff.isActive}
                          disabled={editStaffMutation.isPending}
                        />
                        <Label htmlFor="editIsActive">Active status</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="editIsAdmin"
                          name="isAdmin"
                          defaultChecked={editingStaff.isAdmin}
                          disabled={editStaffMutation.isPending}
                        />
                        <Label htmlFor="editIsAdmin">Administrator privileges</Label>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button
                          type="submit"
                          disabled={editStaffMutation.isPending}
                          className="flex-1"
                        >
                          {editStaffMutation.isPending ? "Updating..." : "Update Staff Member"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditDialogOpen(false)}
                          disabled={editStaffMutation.isPending}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  )}
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : staffList && staffList.length > 0 ? (
            <div className="space-y-4">
              {staffList.map((staff: Staff) => (
                <div
                  key={staff.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {staff.fullName}
                        </p>
                        {staff.isAdmin && (
                          <Badge variant="secondary">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                        <Badge
                          variant={staff.isActive ? "default" : "secondary"}
                          className={
                            staff.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : ""
                          }
                        >
                          {staff.isActive ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {staff.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {staff.designation} • {staff.department}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Username: {staff.username}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(staff)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(staff.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="text-right ml-4">
                      <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created: {formatDate(staff.createdAt.toString())}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No staff members found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}