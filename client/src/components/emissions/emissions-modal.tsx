import { EmissionsForm } from './emissions-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  emission?: any;
}

export function EmissionsModal({
  isOpen,
  onClose,
  emission
}: EmissionsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {emission ? 'Edit Emission Data' : 'Add Emission Data'}
          </DialogTitle>
          <DialogDescription>
            {emission
              ? 'Update the emission record with your changes'
              : 'Enter details about the new emission record'}
          </DialogDescription>
        </DialogHeader>
        
        <EmissionsForm
          initialData={emission}
          onSuccess={onClose}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
