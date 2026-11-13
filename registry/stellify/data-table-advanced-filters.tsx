// "Filtros" button + panel with every filterable column at once. The
// per-column header buttons are for one quick filter; this is for building a
// query across several columns without hunting through the headers.

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FilterWidget } from '@/components/data-table-filter-widget';
import type { FilterableColumn } from '@/components/data-table-active-filters';
import {
  countActiveFilters,
  defaultFilterValue,
  isFilterActive,
  type ActiveFilters,
  type ActiveFilterValue,
} from '@/lib/data-table-filters';
import { cn } from '@/lib/utils';

export interface DataTableAdvancedFiltersLabels {
  /** Trigger text. */
  trigger: string;
  /** Panel title. */
  title: string;
  /** Clears every filter. */
  clearAll: string;
  /** Closes the panel. */
  done: string;
  /** Per-field reset. */
  reset: string;
}

const DEFAULT_LABELS: DataTableAdvancedFiltersLabels = {
  trigger: 'Filtros',
  title: 'Filtros avanzados',
  clearAll: 'Limpiar todo',
  done: 'Listo',
  reset: 'Quitar',
};

export interface DataTableAdvancedFiltersProps {
  columns: FilterableColumn[];
  filters: ActiveFilters;
  onChange: (key: string, value: ActiveFilterValue) => void;
  onClearAll: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  labels?: Partial<DataTableAdvancedFiltersLabels>;
}

/**
 * Filters are applied as you edit them (no "Apply" step), like the header
 * popovers, so the table behind the panel updates live.
 */
export function DataTableAdvancedFilters({
  columns,
  filters,
  onChange,
  onClearAll,
  open,
  onOpenChange,
  labels,
}: DataTableAdvancedFiltersProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const [innerOpen, setInnerOpen] = useState(false);
  const isOpen = open ?? innerOpen;
  const setOpen = (next: boolean) => {
    setInnerOpen(next);
    onOpenChange?.(next);
  };
  const filterable = columns.filter(c => c.filter);
  const count = countActiveFilters(filters);

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={count > 0 ? 'secondary' : 'base'} className={cn(count > 0 && 'text-brand')}>
          <SlidersHorizontal aria-hidden />
          {l.trigger}
          {count > 0 && (
            <span className="ml-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-brand px-1.5 font-mono text-[11px] tabular-nums text-brand-foreground">
              {count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] max-w-[94vw] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-semibold">{l.title}</p>
          {count > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {l.clearAll}
            </button>
          )}
        </div>
        <div className="max-h-[60vh] divide-y overflow-y-auto">
          {filterable.map(col => {
            const value = filters[col.key] ?? defaultFilterValue(col.filter!);
            const active = isFilterActive(filters[col.key]);
            return (
              <div key={col.key} className="space-y-2 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-(--tracking-mono-caps) text-muted-foreground">
                    {col.header}
                  </p>
                  {active && (
                    <button
                      type="button"
                      onClick={() => onChange(col.key, defaultFilterValue(col.filter!))}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {l.reset}
                    </button>
                  )}
                </div>
                <FilterWidget columnKey={col.key} def={col.filter!} value={value} onChange={onChange} />
              </div>
            );
          })}
        </div>
        <div className="flex justify-end border-t bg-surface-2 px-4 py-2.5">
          <Button size="sm" onClick={() => setOpen(false)}>
            {l.done}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default DataTableAdvancedFilters;
