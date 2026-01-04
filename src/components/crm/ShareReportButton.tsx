import { Button } from "@/components/ui/button";
import { Link2, Check } from "lucide-react";
import { useState } from "react";
import { ContactFilter } from "@/types/contact";
import { generateShareableUrl } from "@/lib/urlState";
import { toast } from "@/hooks/use-toast";

interface ShareReportButtonProps {
  filters: ContactFilter;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
}

export function ShareReportButton({ 
  filters, 
  variant = "outline", 
  size = "sm" 
}: ShareReportButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = generateShareableUrl(filters);
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ 
        title: "Link copied!", 
        description: "Share this URL to give others access to this filtered view" 
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ 
        title: "Failed to copy", 
        description: "Please copy the URL manually", 
        variant: "destructive" 
      });
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleCopy}
      className="gap-2"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-primary" />
          Copied!
        </>
      ) : (
        <>
          <Link2 className="h-4 w-4" />
          Share Link
        </>
      )}
    </Button>
  );
}
