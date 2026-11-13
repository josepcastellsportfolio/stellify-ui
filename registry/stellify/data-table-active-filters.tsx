// Active-filter chips: what is narrowing the table, above it. Each chip names
// its column, shows the value, reopens that column's widget when clicked, and
// clears itself with the ✕. "Limpiar filtros" clears them all.

import { X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FilterWidget } from '@/components/data-table-filter-widget';
import {
  describeFilter,
  defaultFilterValue,
  isFilterActive,
  type ActiveFilters,
  type ActiveFilterValue,
  type FilterDef,
} from '@/lib/data-table-filters';

/**
 * The part of a column definition these chips need. Narrower than any table's
 * column type on purpose, so a richer definition satisfies it as-is.
 */
export interface FilterableColumn {
  key: string;
  header: string;
  filter?: FilterDef;
}

export interface DataTableActiveFiltersLabels {
  /** Name of a chip's ✕: "Quitar el filtro de <columna>". */
  remove: (header: string) => string;
  /** Button that clears every filter. */
  clearAll: string;
}

const DEFAULT_LABELS: DataTableActiveFiltersLabels = {
  remove: header => `Quitar el filtro de ${header}`,
  clearAll: 'Limpiar filtros',
};

interface DataTableActiveFiltersProps {
  columns: FilterableColumn[];
  filters: ActiveFilters;
  onChange: (key: string, value: ActiveFilterValue) => void;
  /** Shows "Limpiar filtros" when given. */
  onClearAll?: () => void;
  labels?: Partial<DataTableActiveFiltersLabels>;
}

export function DataTableActiveFilters({ columns, filters, onChange, onClearAll, labels }: DataTableActiveFiltersProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const applied = columns.filter(col => col.filter && isFilterActive(filters[col.key]));

  if (applied.length === 0) return null;

  return (
    <div data-slot="data-table-active-filters" className="flex flex-wrap items-center gap-1.5">
      {applied.map(col => (
        <Popover key={col.key}>
          <span className="inline-flex h-7 items-center gap-1 rounded-full bg-brand-subtle pl-2.5 pr-1 text-xs text-brand">
            <PopoverTrigger asChild>
              <button type="button" className="max-w-[240px] truncate underline-offset-2 hover:underline">
                <span className="font-medium">{col.header}:</span>{' '}
                <span className="font-mono tabular-nums">{describeFilter(filters[col.key], col.filter)}</span>
              </button>
            </PopoverTrigger>
            <button
              type="button"
              onClick={() => onChange(col.key, defaultFilterValue(col.filter!))}
              className="shrink-0 rounded-full p-0.5 transition-colors duration-(--duration-fast) hover:bg-brand/15"
              aria-label={l.remove(col.header)}
            >
              <X className="size-3" aria-hidden />
            </button>
          </span>
          <PopoverContent className="w-[300px] max-w-[90vw] p-3" align="start">
            <p className="mb-2 text-xs font-medium">{col.header}</p>
            <FilterWidget columnKey={col.key} def={col.filter!} value={filters[col.key]} onChange={onChange} />
          </PopoverContent>
        </Popover>
      ))}
      {onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="h-7 rounded-full px-2.5 text-xs text-muted-foreground transition-colors duration-(--duration-fast) hover:bg-surface-2 hover:text-foreground"
        >
          {l.clearAll}
        </button>
      )}
    </div>
  );
}

export default DataTableActiveFilters;
