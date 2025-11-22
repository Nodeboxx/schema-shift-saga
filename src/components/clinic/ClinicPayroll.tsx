import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, DollarSign, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
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

interface ClinicPayrollProps {
  clinicId: string;
}

const ClinicPayroll = ({ clinicId }: ClinicPayrollProps) => {
  const { toast } = useToast();
  const [payrollRecords, setPayrollRecords] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialog, setAddDialog] = useState(false);
  const [stats, setStats] = useState({
    totalPaid: 0,
    totalPending: 0,
    thisMonth: 0,
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
          doctor:profiles!clinic_payroll_doctor_id_fkey(full_name, email)
        `)
        .eq("clinic_id", clinicId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayrollRecords(data || []);

      // Calculate stats
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

      setStats({ totalPaid, totalPending, thisMonth });
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold">৳{stats.totalPaid.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">৳{stats.totalPending.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">৳{stats.thisMonth.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Payroll Records */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold">Payroll Records</h3>
              <p className="text-sm text-muted-foreground">Manage doctor payments</p>
            </div>
            <Button onClick={() => setAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment
            </Button>
          </div>

          {payrollRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payroll records yet. Click "Add Payment" to create one.
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
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.doctor?.full_name || record.doctor?.email}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(record.payment_period_start).toLocaleDateString()} -{" "}
                        {new Date(record.payment_period_end).toLocaleDateString()}
                      </TableCell>
                      <TableCell>৳{parseFloat(record.base_salary).toLocaleString()}</TableCell>
                      <TableCell>৳{parseFloat(record.commission_amount).toLocaleString()}</TableCell>
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
                      <TableCell>
                        {record.payment_status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsPaid(record.id)}
                          >
                            Mark Paid
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>

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
                  <SelectItem value="mobile_banking">Mobile Banking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newPayroll.notes}
                onChange={(e) => setNewPayroll({ ...newPayroll, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold">৳{calculateTotal().toLocaleString()}</span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClinicPayroll;
