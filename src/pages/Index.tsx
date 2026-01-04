import CRMDashboard from "@/components/crm/CRMDashboard";
import { PasswordGate } from "@/components/PasswordGate";

const Index = () => {
  return (
    <PasswordGate storageKey="crm-unlocked">
      <CRMDashboard />
    </PasswordGate>
  );
};

export default Index;
