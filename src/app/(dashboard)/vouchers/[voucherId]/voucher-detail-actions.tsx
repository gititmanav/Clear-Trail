"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteVoucher } from "@/actions/voucher";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface VoucherDetailActionsProps {
  voucherId: string;
  isCancelled: boolean;
}

export function VoucherDetailActions({
  voucherId,
  isCancelled,
}: VoucherDetailActionsProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const result = await deleteVoucher(voucherId);
      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success("Voucher cancelled successfully");
        router.refresh();
      }
    } catch {
      toast.error("Failed to cancel voucher");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {!isCancelled && (
          <Button
            variant="outline"
            size="sm"
            className="text-danger-600 hover:text-danger-700 hover:bg-danger-50"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Cancel Voucher
          </Button>
        )}
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Voucher</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this voucher? This will mark it as
              cancelled. The voucher will still be visible but will not affect
              your accounts.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Keep Voucher
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isDeleting ? "Cancelling..." : "Cancel Voucher"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
