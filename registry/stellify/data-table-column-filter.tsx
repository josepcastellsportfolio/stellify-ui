// Column-header filter trigger — ListFilter icon + Popover with FilterWidget.
// Shown only on filterable columns; icon turns text-primary when filter is active.

import { ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { isFilterActive } from './data-table-filters';
import { FilterWidget } from './data-table-filter-widget';
import type { FilterWidgetProps } from './data-table-filter-widget';

type DataTableColumnFilterProps = FilterWidgetProps;

export function DataTableColumnFilter({ columnKey, def, value, onChange }: DataTableColumnFilterProps) {
  const active = isFilterActive(value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-6 w-6 ml-1 shrink-0',
            active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
          )}
          aria-label={`Filtrar columna`}
        >
          <ListFilter className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      {/* 300px, not the popover default: the date-range presets (Hoy, Ayer,
          7 días, Este mes, Mes pasado) need about 290px to sit on one line,
          and wrapping them was half of what made the old inline filter row
          look broken. Width here is independent of the column's width, which
          is the whole point of moving the widget out of the table. */}
      <PopoverContent className="w-[300px] max-w-[90vw] p-3" align="start" side="bottom">
        <FilterWidget
          columnKey={columnKey}
          def={def}
          value={value}
          onChange={onChange}
        />
      </PopoverContent>
    </Popover>
  );
}
