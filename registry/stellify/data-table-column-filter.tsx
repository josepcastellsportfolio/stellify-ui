// Column-header filter trigger: a funnel button that opens the column's
// FilterWidget in a popover. Shown only on filterable columns; the button
// fills with the brand tint while its filter is active.

import { ListFilter } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { isFilterActive } from '@/lib/data-table-filters';
import { FilterWidget } from '@/components/data-table-filter-widget';
import type { FilterWidgetProps } from '@/components/data-table-filter-widget';

interface DataTableColumnFilterProps extends FilterWidgetProps {
  /** Column name, for the button's accessible name ("Filtrar Importe"). */
  header?: string;
  /** Prefix of the button's name. Defaults to "Filtrar". */
  label?: string;
}

export function DataTableColumnFilter({ columnKey, def, value, onChange, header, label = 'Filtrar' }: DataTableColumnFilterProps) {
  const active = isFilterActive(value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-active={active || undefined}
          className={cn(
            'inline-flex size-6 shrink-0 items-center justify-center rounded-sm transition-colors duration-(--duration-fast)',
            active
              ? 'bg-brand-subtle text-brand'
              : 'text-muted-foreground/70 hover:bg-surface-3 hover:text-foreground',
          )}
          aria-label={header ? `${label} ${header}` : label}
        >
          <ListFilter className="size-3.5" aria-hidden />
        </button>
      </PopoverTrigger>
      {/* 300px: the date-range presets need about 290px to sit on one line. */}
      <PopoverContent className="w-[300px] max-w-[90vw] p-3 font-sans normal-case tracking-normal" align="start" side="bottom">
        {header && <p className="mb-2 text-xs font-medium text-foreground">{header}</p>}
        <FilterWidget columnKey={columnKey} def={def} value={value} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
}
