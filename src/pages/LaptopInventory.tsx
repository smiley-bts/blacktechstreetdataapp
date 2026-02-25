import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  useLaptops,
  useLaptopHistory,
  useCreateLaptop,
  useCheckOutLaptop,
  useReturnLaptop,
  Laptop,
  LaptopCheckout,
} from '@/hooks/useLaptops';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  ArrowLeft,
  Laptop as LaptopIcon,
  Plus,
  ArrowRightLeft,
  RotateCcw,
  Clock,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import btsLogo from '@/assets/black-tech-street-logo.png';
import { format } from 'date-fns';

function LaptopCard({
  laptop,
  onCheckOut,
  onReturn,
  onViewHistory,
}: {
  laptop: Laptop;
  onCheckOut: () => void;
  onReturn: () => void;
  onViewHistory: () => void;
}) {
  const isAvailable = !laptop.current_checkout;

  return (
    <Card className={`transition-all ${isAvailable ? 'border-emerald-500/30' : 'border-amber-500/30'}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${isAvailable ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
              <LaptopIcon className={`h-6 w-6 ${isAvailable ? 'text-emerald-500' : 'text-amber-500'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{laptop.label}</h3>
              {(laptop.make || laptop.model) && (
                <p className="text-sm text-muted-foreground">
                  {[laptop.make, laptop.model].filter(Boolean).join(' ')}
                </p>
              )}
            </div>
          </div>
          <Badge variant={isAvailable ? 'default' : 'secondary'} className={isAvailable ? 'bg-emerald-600' : 'bg-amber-600 text-white'}>
            {isAvailable ? 'Available' : 'Checked Out'}
          </Badge>
        </div>

        {laptop.current_checkout && (
          <div className="bg-muted/50 rounded-lg p-3 mb-3 space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{laptop.current_checkout.checked_out_to}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Since {format(new Date(laptop.current_checkout.checked_out_at), 'MMM d, h:mm a')}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {isAvailable ? (
            <Button
              size="sm"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={onCheckOut}
            >
              <ArrowRightLeft className="h-4 w-4 mr-1.5" />
              Check Out
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-amber-500 text-amber-500 hover:bg-amber-500/10"
              onClick={onReturn}
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Return
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onViewHistory}>
            <Clock className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LaptopInventoryContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: laptops, isLoading } = useLaptops();

  const [addOpen, setAddOpen] = useState(false);
  const [addLabel, setAddLabel] = useState('');
  const [addMake, setAddMake] = useState('');
  const [addModel, setAddModel] = useState('');

  const [checkOutLaptop, setCheckOutLaptop] = useState<Laptop | null>(null);
  const [coName, setCoName] = useState('');
  const [coEmail, setCoEmail] = useState('');

  const [historyLaptop, setHistoryLaptop] = useState<Laptop | null>(null);
  const { data: historyData } = useLaptopHistory(historyLaptop?.id);

  const createMutation = useCreateLaptop();
  const checkOutMutation = useCheckOutLaptop();
  const returnMutation = useReturnLaptop();

  const handleAdd = async () => {
    if (!addLabel.trim()) return;
    try {
      await createMutation.mutateAsync({
        label: addLabel.trim(),
        make: addMake.trim() || undefined,
        model: addModel.trim() || undefined,
      });
      toast.success(`${addLabel} added to inventory`);
      setAddOpen(false);
      setAddLabel('');
      setAddMake('');
      setAddModel('');
    } catch (err) {
      toast.error('Failed to add laptop');
    }
  };

  const handleCheckOut = async () => {
    if (!checkOutLaptop || !coName.trim()) return;
    try {
      await checkOutMutation.mutateAsync({
        laptopId: checkOutLaptop.id,
        checkedOutTo: coName.trim(),
        email: coEmail.trim() || undefined,
        userId: user?.id,
      });
      toast.success(`${checkOutLaptop.label} checked out to ${coName}`);
      setCheckOutLaptop(null);
      setCoName('');
      setCoEmail('');
    } catch (err) {
      toast.error('Failed to check out laptop');
    }
  };

  const handleReturn = async (laptop: Laptop) => {
    if (!laptop.current_checkout) return;
    try {
      await returnMutation.mutateAsync({
        checkoutId: laptop.current_checkout.id,
        userId: user?.id,
      });
      toast.success(`${laptop.label} returned`);
    } catch (err) {
      toast.error('Failed to return laptop');
    }
  };

  const available = (laptops || []).filter((l) => !l.current_checkout).length;
  const checkedOut = (laptops || []).filter((l) => l.current_checkout).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/staff')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <img src={btsLogo} alt="BTS" className="h-8 w-auto" />
              <div>
                <h1 className="text-lg font-bold text-foreground">Laptop Inventory</h1>
                <p className="text-xs text-muted-foreground">
                  {available} available, {checkedOut} checked out
                </p>
              </div>
            </div>
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Laptop
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading inventory...</div>
        ) : (laptops || []).length === 0 ? (
          <div className="text-center py-12">
            <LaptopIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No laptops yet</h3>
            <p className="text-muted-foreground mb-4">Add laptops to start tracking checkouts.</p>
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Laptop
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(laptops || []).map((laptop) => (
              <LaptopCard
                key={laptop.id}
                laptop={laptop}
                onCheckOut={() => setCheckOutLaptop(laptop)}
                onReturn={() => handleReturn(laptop)}
                onViewHistory={() => setHistoryLaptop(laptop)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add Laptop Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Laptop</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Label *</Label>
              <Input
                value={addLabel}
                onChange={(e) => setAddLabel(e.target.value)}
                placeholder='e.g., "Laptop #1" or "Dell-03"'
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Make</Label>
                <Input
                  value={addMake}
                  onChange={(e) => setAddMake(e.target.value)}
                  placeholder="e.g., Dell"
                />
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Input
                  value={addModel}
                  onChange={(e) => setAddModel(e.target.value)}
                  placeholder="e.g., Latitude 5520"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!addLabel.trim() || createMutation.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              Add Laptop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check Out Dialog */}
      <Dialog open={!!checkOutLaptop} onOpenChange={() => setCheckOutLaptop(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check Out: {checkOutLaptop?.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Borrower Name *</Label>
              <Input
                value={coName}
                onChange={(e) => setCoName(e.target.value)}
                placeholder="Who is borrowing this laptop?"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Email (optional)</Label>
              <Input
                type="email"
                value={coEmail}
                onChange={(e) => setCoEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckOutLaptop(null)}>Cancel</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleCheckOut}
              disabled={!coName.trim() || checkOutMutation.isPending}
            >
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Check Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Sheet */}
      <Sheet open={!!historyLaptop} onOpenChange={() => setHistoryLaptop(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>History: {historyLaptop?.label}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            {(!historyData || historyData.length === 0) ? (
              <p className="text-sm text-muted-foreground">No checkout history yet.</p>
            ) : (
              historyData.map((entry) => (
                <div key={entry.id} className="border border-border rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{entry.checked_out_to}</span>
                    <Badge variant={entry.returned_at ? 'secondary' : 'default'} className={!entry.returned_at ? 'bg-amber-600' : ''}>
                      {entry.returned_at ? 'Returned' : 'Active'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Out: {format(new Date(entry.checked_out_at), 'MMM d, yyyy h:mm a')}
                  </p>
                  {entry.returned_at && (
                    <p className="text-xs text-muted-foreground">
                      In: {format(new Date(entry.returned_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function LaptopInventory() {
  return (
    <ProtectedRoute requireAdmin>
      <LaptopInventoryContent />
    </ProtectedRoute>
  );
}
