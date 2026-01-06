import CRMDashboard from "@/components/crm/CRMDashboard";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const Index = () => {
  return (
    <ProtectedRoute requireAdmin>
      <CRMDashboard />
    </ProtectedRoute>
  );
};

export default Index;
