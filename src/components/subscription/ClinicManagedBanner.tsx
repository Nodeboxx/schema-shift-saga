import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, CheckCircle } from "lucide-react";

interface ClinicManagedBannerProps {
  clinicName: string;
}

export const ClinicManagedBanner = ({ clinicName }: ClinicManagedBannerProps) => {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Subscription Status
          </CardTitle>
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Enterprise
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Managed by
          </p>
          <p className="text-lg font-semibold">{clinicName}</p>
          <p className="text-xs text-muted-foreground mt-3">
            You have full access to all enterprise features through your clinic's subscription.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
