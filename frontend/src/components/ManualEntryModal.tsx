import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ManualEntryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; totalMarks: number; obtainedMarks: number }) => void;
}

const ManualEntryModal = ({ open, onClose, onSave }: ManualEntryModalProps) => {
  const [title, setTitle] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [obtainedMarks, setObtainedMarks] = useState("");
  const { toast } = useToast();

  if (!open) return null;

  const handleSave = () => {
    if (!title.trim() || !totalMarks || !obtainedMarks) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }
    onSave({ title: title.trim(), totalMarks: Number(totalMarks), obtainedMarks: Number(obtainedMarks) });
    toast({ title: "Saved", description: "Score entry saved successfully" });
    setTitle("");
    setTotalMarks("");
    setObtainedMarks("");
  };

  const handleCancel = () => {
    setTitle("");
    setTotalMarks("");
    setObtainedMarks("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl animate-fade-in">
        <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-semibold text-foreground mb-4">Manual Entry</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title / Topic</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Algebra Test 2" />
          </div>
          <div className="space-y-2">
            <Label>Total Marks</Label>
            <Input type="number" value={totalMarks} onChange={e => setTotalMarks(e.target.value)} placeholder="25" />
          </div>
          <div className="space-y-2">
            <Label>Obtained Marks</Label>
            <Input type="number" value={obtainedMarks} onChange={e => setObtainedMarks(e.target.value)} placeholder="20" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button className="flex-1 gradient-primary text-primary-foreground" onClick={handleSave}>Save</Button>
          <Button variant="outline" className="flex-1" onClick={handleCancel}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default ManualEntryModal;
