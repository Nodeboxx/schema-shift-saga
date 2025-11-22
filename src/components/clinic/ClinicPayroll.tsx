import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Download, 
  Filter, 
  Search,
  Edit,
  Eye,
  Trash2,
  FileText,
  TrendingUp,
  Users
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ClinicPayrollProps {
  clinicId: string;
}

const ClinicPayroll = ({ clinicId }: ClinicPayrollProps) => {
  const { toast } = useToast();
  const [payrollRecords, setPayrollRecords] = useState<any[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialog, setAddDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  
  const [stats, setStats] = useState({
    totalPaid: 0,
    totalPending: 0,
    thisMonth: 0,
    avgSalary: 0,
    totalDoctors: 0,
  });

  const [newPayroll, setNewPayroll] = useState({
    doctor_id: "",
    payment_period_start: "",
    payment_period_end: "",
    base_salary: "",
    commission_percentage: "",
    commission_amount: "",
    bonus: "",
    deductions: "",
    payment_method: "",
    notes: "",
  });

  useEffect(() => {
    loadPayrollData();
    loadDoctors();
  }, [clinicId]);

  useEffect(() => {
    filterRecords();
  }, [payrollRecords, searchTerm, statusFilter, dateFilter]);

  const loadDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, specialization")
        .eq("clinic_id", clinicId)
        .eq("role", "doctor");

      if (error) throw error;
      setDoctors(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadPayrollData = async () => {
    try {
      const { data, error } = await supabase
        .from("clinic_payroll")
        .select(`
          *,
          doctor:profiles!clinic_payroll_doctor_id_fkey(full_name, email, specialization)
        `)
        .eq("clinic_id", clinicId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayrollRecords(data || []);

      // Calculate advanced stats
      const totalPaid = data
        ?.filter((r) => r.payment_status === "paid")
        .reduce((sum, r) => sum + Number(r.total_amount), 0) || 0;

      const totalPending = data
        ?.filter((r) => r.payment_status === "pending")
        .reduce((sum, r) => sum + Number(r.total_amount), 0) || 0;

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonth = data
        ?.filter((r) => {
          const paymentDate = new Date(r.payment_period_end);
          return paymentDate >= firstDayOfMonth && r.payment_status === "paid";
        })
        .reduce((sum, r) => sum + Number(r.total_amount), 0) || 0;

      const avgSalary = data && data.length > 0 
        ? data.reduce((sum, r) => sum + Number(r.total_amount), 0) / data.length 
        : 0;

      const uniqueDoctors = new Set(data?.map(r => r.doctor_id) || []).size;

      setStats({ 
        totalPaid, 
        totalPending, 
        thisMonth, 
        avgSalary,
        totalDoctors: uniqueDoctors 
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = [...payrollRecords];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.doctor?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.doctor?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(record => record.payment_status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.payment_period_end);
        switch(dateFilter) {
          case "this_month":
            return recordDate.getMonth() === now.getMonth() && 
                   recordDate.getFullYear() === now.getFullYear();
          case "last_month":
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            return recordDate.getMonth() === lastMonth.getMonth() && 
                   recordDate.getFullYear() === lastMonth.getFullYear();
          case "this_quarter":
            const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
            return recordDate >= quarterStart;
          default:
            return true;
        }
      });
    }

    setFilteredRecords(filtered);
  };

  const calculateTotal = () => {
    const base = parseFloat(newPayroll.base_salary) || 0;
    const commission = parseFloat(newPayroll.commission_amount) || 0;
    const bonus = parseFloat(newPayroll.bonus) || 0;
    const deductions = parseFloat(newPayroll.deductions) || 0;
    return base + commission + bonus - deductions;
  };

  const handleAddPayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const totalAmount = calculateTotal();

      const { error } = await supabase.from("clinic_payroll").insert({
        clinic_id: clinicId,
        doctor_id: newPayroll.doctor_id,
        payment_period_start: newPayroll.payment_period_start,
        payment_period_end: newPayroll.payment_period_end,
        base_salary: parseFloat(newPayroll.base_salary) || 0,
        commission_percentage: parseFloat(newPayroll.commission_percentage) || 0,
        commission_amount: parseFloat(newPayroll.commission_amount) || 0,
        bonus: parseFloat(newPayroll.bonus) || 0,
        deductions: parseFloat(newPayroll.deductions) || 0,
        total_amount: totalAmount,
        payment_status: "pending",
        payment_method: newPayroll.payment_method || null,
        notes: newPayroll.notes || null,
        created_by: user.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payroll record created successfully",
      });

      setAddDialog(false);
      resetForm();
      loadPayrollData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewPayroll({
      doctor_id: "",
      payment_period_start: "",
      payment_period_end: "",
      base_salary: "",
      commission_percentage: "",
      commission_amount: "",
      bonus: "",
      deductions: "",
      payment_method: "",
      notes: "",
    });
  };

  const markAsPaid = async (payrollId: string) => {
    try {
      const { error } = await supabase
        .from("clinic_payroll")
        .update({
          payment_status: "paid",
          payment_date: new Date().toISOString().split("T")[0],
        })
        .eq("id", payrollId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment marked as paid",
      });

      loadPayrollData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deletePayroll = async (payrollId: string) => {
    if (!confirm("Are you sure you want to delete this payroll record?")) return;

    try {
      const { error } = await supabase
        .from("clinic_payroll")
        .delete()
        .eq("id", payrollId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payroll record deleted successfully",
      });

      loadPayrollData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const headers = ["Doctor", "Period Start", "Period End", "Base Salary", "Commission", "Bonus", "Deductions", "Total", "Status", "Payment Date"];
    const rows = filteredRecords.map(record => [
      record.doctor?.full_name || record.doctor?.email || "N/A",
      record.payment_period_start,
      record.payment_period_end,
      record.base_salary,
      record.commission_amount,
      record.bonus,
      record.deductions,
      record.total_amount,
      record.payment_status,
      record.payment_date || "N/A"
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll-records-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Payroll records exported successfully",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  if (loading && payrollRecords.length === 0) {
    return <Card className="p-6"><div>Loading payroll data...</div></Card>;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-2xl font-bold">৳{stats.totalPaid.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">৳{stats.totalPending.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">৳{stats.thisMonth.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Salary</p>
                  <p className="text-2xl font-bold">৳{Math.round(stats.avgSalary).toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Doctors</p>
                  <p className="text-2xl font-bold">{stats.totalDoctors}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Payroll Records</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Manage doctor payments</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button size="sm" onClick={() => setAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by doctor name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="this_quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No payroll records found</p>
                <p className="text-sm mb-4">
                  {payrollRecords.length === 0 
                    ? "Click 'Add Payment' to create your first payroll record" 
                    : "Try adjusting your filters"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Base Salary</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Bonus</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.doctor?.full_name || "N/A"}</p>
                            <p className="text-xs text-muted-foreground">{record.doctor?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(record.payment_period_start).toLocaleDateString()} - {new Date(record.payment_period_end).toLocaleDateString()}
                        </TableCell>
                        <TableCell>৳{parseFloat(record.base_salary).toLocaleString()}</TableCell>
                        <TableCell>৳{parseFloat(record.commission_amount).toLocaleString()}</TableCell>
                        <TableCell>৳{parseFloat(record.bonus || 0).toLocaleString()}</TableCell>
                        <TableCell>৳{parseFloat(record.deductions || 0).toLocaleString()}</TableCell>
                        <TableCell className="font-semibold">
                          ৳{parseFloat(record.total_amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.payment_status === "paid"
                                ? "default"
                                : record.payment_status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                            className="flex items-center gap-1 w-fit"
                          >
                            {getStatusIcon(record.payment_status)}
                            {record.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedRecord(record);
                                setViewDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {record.payment_status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsPaid(record.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deletePayroll(record.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Payment Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Payroll Record</DialogTitle>
            <DialogDescription>Create a new payment record for a doctor</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddPayroll} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doctor">Doctor *</Label>
              <Select
                value={newPayroll.doctor_id}
                onValueChange={(value) => setNewPayroll({ ...newPayroll, doctor_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.full_name || doctor.email}
                      {doctor.specialization && ` - ${doctor.specialization}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="period_start">Period Start *</Label>
                <Input
                  id="period_start"
                  type="date"
                  value={newPayroll.payment_period_start}
                  onChange={(e) =>
                    setNewPayroll({ ...newPayroll, payment_period_start: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="period_end">Period End *</Label>
                <Input
                  id="period_end"
                  type="date"
                  value={newPayroll.payment_period_end}
                  onChange={(e) =>
                    setNewPayroll({ ...newPayroll, payment_period_end: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base_salary">Base Salary (৳) *</Label>
                <Input
                  id="base_salary"
                  type="number"
                  step="0.01"
                  value={newPayroll.base_salary}
                  onChange={(e) => setNewPayroll({ ...newPayroll, base_salary: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commission_percentage">Commission %</Label>
                <Input
                  id="commission_percentage"
                  type="number"
                  step="0.01"
                  value={newPayroll.commission_percentage}
                  onChange={(e) =>
                    setNewPayroll({ ...newPayroll, commission_percentage: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commission_amount">Commission Amount (৳)</Label>
                <Input
                  id="commission_amount"
                  type="number"
                  step="0.01"
                  value={newPayroll.commission_amount}
                  onChange={(e) =>
                    setNewPayroll({ ...newPayroll, commission_amount: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bonus">Bonus (৳)</Label>
                <Input
                  id="bonus"
                  type="number"
                  step="0.01"
                  value={newPayroll.bonus}
                  onChange={(e) => setNewPayroll({ ...newPayroll, bonus: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deductions">Deductions (৳)</Label>
              <Input
                id="deductions"
                type="number"
                step="0.01"
                value={newPayroll.deductions}
                onChange={(e) => setNewPayroll({ ...newPayroll, deductions: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Tax, insurance, or other deductions</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select
                value={newPayroll.payment_method}
                onValueChange={(value) => setNewPayroll({ ...newPayroll, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="mobile_banking">Mobile Banking (bKash/Nagad)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newPayroll.notes}
                onChange={(e) => setNewPayroll({ ...newPayroll, notes: e.target.value })}
                placeholder="Additional notes or comments"
                rows={3}
              />
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold">৳{calculateTotal().toLocaleString()}</span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Payroll Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payroll Details</DialogTitle>
            <DialogDescription>Complete payment information</DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Doctor</Label>
                  <p className="font-medium">{selectedRecord.doctor?.full_name || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">{selectedRecord.doctor?.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge
                    variant={
                      selectedRecord.payment_status === "paid"
                        ? "default"
                        : selectedRecord.payment_status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                    className="flex items-center gap-1 w-fit mt-2"
                  >
                    {getStatusIcon(selectedRecord.payment_status)}
                    {selectedRecord.payment_status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Payment Period</Label>
                  <p className="font-medium">
                    {new Date(selectedRecord.payment_period_start).toLocaleDateString()} -{" "}
                    {new Date(selectedRecord.payment_period_end).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Payment Method</Label>
                  <p className="font-medium capitalize">
                    {selectedRecord.payment_method?.replace("_", " ") || "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Salary:</span>
                  <span className="font-medium">৳{parseFloat(selectedRecord.base_salary).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commission ({selectedRecord.commission_percentage}%):</span>
                  <span className="font-medium">৳{parseFloat(selectedRecord.commission_amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bonus:</span>
                  <span className="font-medium">৳{parseFloat(selectedRecord.bonus || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deductions:</span>
                  <span className="font-medium text-red-500">-৳{parseFloat(selectedRecord.deductions || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-3 text-lg">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="font-bold">৳{parseFloat(selectedRecord.total_amount).toLocaleString()}</span>
                </div>
              </div>

              {selectedRecord.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="mt-2 text-sm bg-muted p-3 rounded-lg">{selectedRecord.notes}</p>
                </div>
              )}

              {selectedRecord.payment_date && (
                <div>
                  <Label className="text-muted-foreground">Payment Date</Label>
                  <p className="font-medium mt-1">
                    {new Date(selectedRecord.payment_date).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="text-xs text-muted-foreground border-t pt-4">
                <p>Created: {new Date(selectedRecord.created_at).toLocaleString()}</p>
                {selectedRecord.updated_at && (
                  <p>Updated: {new Date(selectedRecord.updated_at).toLocaleString()}</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            {selectedRecord?.payment_status === "pending" && (
              <Button onClick={() => {
                markAsPaid(selectedRecord.id);
                setViewDialog(false);
              }}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Paid
              </Button>
            )}
            <Button variant="outline" onClick={() => setViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClinicPayroll;
