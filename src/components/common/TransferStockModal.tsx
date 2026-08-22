import React, { useState } from 'react';
import { 
  X, ArrowLeftRight, Warehouse, Boxes, CheckCircle2, 
  AlertTriangle, ShieldCheck, Truck, Clock 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { db } from '../../lib/database';
import { store } from '../../lib/supabase';
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
      <div className="w-full max-w-lg glass-panel bg-neutral-900/95 rounded-2xl border border-white/15 shadow-2xl p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Emergency Stock Transfer</h3>
              <p className="text-xs text-neutral-400">Inter-facility inventory rebalancing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Buffer Stock Dispatched Successfully!</h4>
            <p className="text-xs text-neutral-300 max-w-xs mx-auto">
              300 units of TX-9 Microcontrollers transferred to Pune Facility. Downstream critical blocker cleared.
            </p>
          </div>
        ) : (
          <form onSubmit={handleTransfer} className="space-y-4 text-xs">
            
            {/* Source Facility */}
            <div>
              <label className="block text-neutral-400 uppercase font-mono text-[10px] mb-1.5 font-semibold">
                Origin Facility (Source Stock)
              </label>
              <select
                value={fromWarehouse}
                onChange={e => setFromWarehouse(e.target.value)}
                className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
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
              <label className="block text-neutral-400 uppercase font-mono text-[10px] mb-1.5 font-semibold">
                Target Facility (Deficit Hub)
              </label>
              <select
                value={toWarehouse}
                onChange={e => setToWarehouse(e.target.value)}
                className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
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
                <label className="block text-neutral-400 uppercase font-mono text-[10px] mb-1.5 font-semibold">
                  Product Item
                </label>
                <select
                  value={productId}
                  onChange={e => setProductId(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  {SEED_PRODUCTS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 uppercase font-mono text-[10px] mb-1.5 font-semibold">
                  Units Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  max={5000}
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Info notice */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-neutral-300 flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-300">Expedited Expressway Transit:</span>
                <p className="text-[11px] text-neutral-300 mt-0.5">
                  Direct courier transfer (Mumbai Port → Pune Express Highway) completes within 3.5 hours, resolving order fulfillment risks.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
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
