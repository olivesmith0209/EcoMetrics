import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <div className="fixed bottom-6 right-6">
      <Button
        onClick={onClick}
        size="icon"
        className="floating-action-btn"
        aria-label="Add new emission"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
