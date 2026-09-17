// Active-filter chips — what is currently narrowing the table, above it.
//
// With the filter controls moved into per-column popovers, nothing on screen
// would otherwise say a filter is applied except a tinted icon in a header
// that may be scrolled out of view. Each chip names its column, shows the
// value, reopens that column's popover when clicked, and clears itself with
// the ✕.

import { X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { FilterWidget } from './data-table-filter-widget';
import {
  describeFilter,
  defaultFilterValue,
  isFilterActive,
  type ActiveFilters,
  type ActiveFilterValue,
  type FilterDef,
} from './data-table-filters';

/**
 * The part of a column definition these chips need.
 *
 * Deliberately narrower than any particular table's ColumnDef so this
 * composes with whatever column shape the consumer already has: structural
 * typing means a richer definition satisfies it as-is.
 */
export interface FilterableColumn {
  key: string;
  header: string;
  filter?: FilterDef;
}

interface DataTableActiveFiltersProps {
  columns: FilterableColumn[];
  filters: ActiveFilters;
  onChange: (key: string, value: ActiveFilterValue) => void;
}

export function DataTableActiveFilters({
  columns,
  filters,
  onChange,
}: DataTableActiveFiltersProps) {
  const applied = columns.filter(
    col => col.filter && isFilterActive(filters[col.key]),
  );

  if (applied.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {applied.map(col => (
        <Popover key={col.key}>
          <span
            className={cn(
              'inline-flex items-center rounded-full border border-primary/30',
              'bg-primary/10 text-primary text-xs h-7 pl-2.5 pr-1 gap-1',
            )}
          >
            <PopoverTrigger asChild>
              <button
                className="max-w-[220px] truncate hover:underline"
                title="Editar este filtro"
              >
                <span className="font-medium">{col.header}:</span>{' '}
                {describeFilter(filters[col.key], col.filter)}
              </button>
            </PopoverTrigger>
            <button
              onClick={() => onChange(col.key, defaultFilterValue(col.filter!))}
              className="rounded-full p-0.5 hover:bg-primary/20 shrink-0"
              aria-label={`Quitar el filtro de ${col.header}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
          <PopoverContent className="w-[300px] max-w-[90vw] p-3" align="start">
            <p className="text-xs font-medium mb-2">{col.header}</p>
            <FilterWidget
              columnKey={col.key}
              def={col.filter!}
              value={filters[col.key]}
              onChange={onChange}
            />
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}

export default DataTableActiveFilters;
