import React, { useState } from 'react';
import { 
  X, ArrowLeftRight, CheckCircle2, 
  Truck, Clock 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { db } from '../../lib/database';
import { SEED_PRODUCTS, SEED_WAREHOUSES } from '../../lib/seed-data';

interface TransferStockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferStockModal: React.FC<TransferStockModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { refreshData } = useRealtime();

  const [fromWarehouse, setFromWarehouse] = useState<string>('wh-mumbai-01');
  const [toWarehouse, setToWarehouse] = useState<string>('wh-pune-01');
  const [productId, setProductId] = useState<string>('prod-tx9-mcu');
  const [quantity, setQuantity] = useState<number>(300);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await db.requestInventoryTransfer({
        sourceWarehouseId: fromWarehouse,
        destinationWarehouseId: toWarehouse,
        productId,
        quantity,
        requestedBy: user.id,
        associatedIncidentId: 'inc-pune-critical-01',
      });

      setIsSuccess(true);
      await refreshData();

      setTimeout(() => {
        setIsSuccess(false);
        setIsSubmitting(false);
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-hairline)] shadow-2xl p-6 space-y-5 transition-colors duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--border-hairline)] pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Emergency Stock Transfer</h3>
              <p className="text-xs text-[var(--text-muted)]">Inter-facility inventory rebalancing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="h-14 w-14 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">Buffer Stock Dispatched Successfully!</h4>
            <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
              300 units of TX-9 Microcontrollers transferred to Pune Facility. Downstream critical blocker cleared.
            </p>
          </div>
        ) : (
          <form onSubmit={handleTransfer} className="space-y-4 text-xs">
            
            {/* Source Facility */}
            <div>
              <label className="block text-[var(--text-muted)] uppercase font-mono text-[10px] mb-1.5 font-bold">
                Origin Facility (Source Stock)
              </label>
              <select
                value={fromWarehouse}
                onChange={e => setFromWarehouse(e.target.value)}
                className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] rounded-2xl px-4 py-2.5 text-[var(--text-primary)] text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {SEED_WAREHOUSES.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Facility */}
            <div>
              <label className="block text-[var(--text-muted)] uppercase font-mono text-[10px] mb-1.5 font-bold">
                Target Facility (Deficit Hub)
              </label>
              <select
                value={toWarehouse}
                onChange={e => setToWarehouse(e.target.value)}
                className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] rounded-2xl px-4 py-2.5 text-[var(--text-primary)] text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {SEED_WAREHOUSES.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Product & Quantity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[var(--text-muted)] uppercase font-mono text-[10px] mb-1.5 font-bold">
                  Product Item
                </label>
                <select
                  value={productId}
                  onChange={e => setProductId(e.target.value)}
                  className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] rounded-2xl px-3.5 py-2.5 text-[var(--text-primary)] text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {SEED_PRODUCTS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] uppercase font-mono text-[10px] mb-1.5 font-bold">
                  Units Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  max={5000}
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-hairline)] rounded-2xl px-4 py-2.5 text-[var(--text-primary)] font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Info notice */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[var(--text-primary)] flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Expedited Expressway Transit:</span>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Direct courier transfer (Mumbai Port → Pune Express Highway) completes within 3.5 hours, resolving order fulfillment risks.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl bg-[var(--bg-surface-elevated)] hover:bg-[var(--border-hairline)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-medium transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-neutral-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Truck className="h-3.5 w-3.5" />
                <span>{isSubmitting ? 'Dispatching...' : 'Authorize & Dispatch Transfer'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
