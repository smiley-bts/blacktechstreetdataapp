import { PasswordGate } from "@/components/PasswordGate";
import CRMDashboard from "@/components/crm/CRMDashboard";

export default function CRM() {
  return (
    <PasswordGate storageKey="crm-unlocked">
      <CRMDashboard />
    </PasswordGate>
  );
}
