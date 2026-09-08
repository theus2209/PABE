import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onConfirm: () => void;
}

export function ConfirmDialog({ open, onOpenChange, title, description, onConfirm }: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-gray-800 border-gray-700">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-600 rounded-full p-3">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-white text-lg font-semibold">
              {title}
            </DialogTitle>
          </div>
        </DialogHeader>

        {description && (
          <p className="text-gray-300 text-sm leading-relaxed">
            {description}
          </p>
        )}

        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white border-gray-600 py-6 text-base font-semibold"
          >
            NÃO
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-6 text-base font-semibold"
          >
            SIM
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
