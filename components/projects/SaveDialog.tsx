'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SaveDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  initialName?: string;
}

export function SaveDialog({ open, onClose, onSave }: SaveDialogProps) {
  const [name, setName] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (open) {
      setName('');
      setError('');
    }
  }, [open]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      await onSave(name.trim());
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260, mass: 1 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm"
          >
            <div className="mx-4 rounded-2xl border border-border/40 bg-background shadow-2xl overflow-hidden">
              <div className="p-5 space-y-4">
                <h2 className="text-sm font-semibold text-foreground">Save Project</h2>

                {error && (
                  <div className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Project Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    placeholder="My Project"
                    className="w-full h-9 px-3 text-sm rounded-xl border border-border/40 bg-muted/30 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    disabled={saving}
                    className="flex-1 h-9 text-sm font-medium rounded-xl border border-border/40 bg-muted/30 hover:bg-muted/60 transition-all text-foreground disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !name.trim()}
                    className="flex-1 h-9 text-sm font-semibold text-white rounded-lg transition-all bg-[linear-gradient(110deg,#c9d4ff_0%,#e0d4ff_45%,#f5d4e8_100%)] hover:opacity-90 disabled:opacity-40 cursor-pointer"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
