// Shared filter widget renderer — used by DataGridColumnFilter (column header popovers)
// All 10 filter types from StellifyitFilters are rendered here.

import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  ActiveFilterValue,
  FilterDef,
  SelectOption,
  StringOperator,
  NumberOperator,
} from './data-table-filters';
import {
  defaultFilterValue,
  STRING_OPERATOR_LABELS,
  NUMBER_OPERATOR_LABELS,
} from './data-table-filters';

// ── Date formatting helper ─────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ── Multiselect widget ─────────────────────────────────────────────────────────

interface MultiselectWidgetProps {
  options: SelectOption[];
  loadOptions?: () => Promise<SelectOption[]>;
  values: string[];
  onChange: (values: string[]) => void;
}

export const MultiselectWidget: React.FC<MultiselectWidgetProps> = ({
  options: staticOptions,
  loadOptions,
  values,
  onChange,
}) => {
  const [asyncOptions, setAsyncOptions] = useState<SelectOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const effectiveOptions = loadOptions ? asyncOptions : staticOptions;

  useEffect(() => {
    if (loadOptions && !loaded) {
      setLoadingOptions(true);
      loadOptions()
        .then(opts => { setAsyncOptions(opts); setLoaded(true); })
        .finally(() => setLoadingOptions(false));
    }
  }, [loadOptions, loaded]);

  const toggle = (value: string) => {
    onChange(values.includes(value) ? values.filter(v => v !== value) : [...values, value]);
  };

  if (loadingOptions) return <p className="text-sm text-muted-foreground py-1">Cargando...</p>;
  if (effectiveOptions.length === 0) return <p className="text-sm text-muted-foreground py-1">Sin opciones</p>;

  return (
    <div className="space-y-1">
      {effectiveOptions.map(opt => (
        <label
          key={opt.value}
          className="flex items-center gap-2 px-1 py-1 rounded-sm hover:bg-accent cursor-pointer text-sm"
        >
          <input
            type="checkbox"
            checked={values.includes(opt.value)}
            onChange={() => toggle(opt.value)}
            className="rounded border-input"
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
};

// ── FilterWidget ───────────────────────────────────────────────────────────────

export interface FilterWidgetProps {
  columnKey: string;
  def: FilterDef;
  value: ActiveFilterValue | undefined;
  onChange: (key: string, value: ActiveFilterValue) => void;
}

export const FilterWidget: React.FC<FilterWidgetProps> = ({ columnKey, def, value, onChange }) => {
  const current = value ?? defaultFilterValue(def);

  if (def.type === 'string' && current.type === 'string') {
    const operators = def.operators ?? ['contains', 'equals', 'starts_with', 'ends_with'];
    return (
      <div className="flex gap-1 w-full">
        <Select
          value={current.operator}
          onValueChange={(op) => onChange(columnKey, { ...current, operator: op as StringOperator })}
        >
          <SelectTrigger className="h-9 w-[120px] text-xs shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {operators.map(op => (
              <SelectItem key={op} value={op} className="text-xs">
                {STRING_OPERATOR_LABELS[op as StringOperator]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          className="h-9 text-sm"
          placeholder={def.placeholder ?? 'Filtrar...'}
          value={current.value}
          onChange={(e) => onChange(columnKey, { ...current, value: e.target.value })}
        />
      </div>
    );
  }

  if (def.type === 'number' && current.type === 'number') {
    const operators = def.operators ?? ['eq', 'lt', 'lte', 'gt', 'gte'];
    return (
      <div className="flex gap-1 w-full">
        <Select
          value={current.operator}
          onValueChange={(op) => onChange(columnKey, { ...current, operator: op as NumberOperator })}
        >
          <SelectTrigger className="h-9 w-[60px] text-sm shrink-0 font-mono">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {operators.map(op => (
              <SelectItem key={op} value={op} className="text-sm font-mono">
                {NUMBER_OPERATOR_LABELS[op as NumberOperator]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          className="h-9 text-sm"
          placeholder={def.placeholder ?? '0'}
          value={current.value}
          onChange={(e) => onChange(columnKey, { ...current, value: e.target.value })}
        />
      </div>
    );
  }

  if (def.type === 'number_range' && current.type === 'number_range') {
    return (
      <div className="flex items-center gap-1 w-full">
        <Input
          type="number"
          className="h-9 text-sm"
          placeholder={def.fromPlaceholder ?? 'Min'}
          value={current.from}
          onChange={(e) => onChange(columnKey, { ...current, from: e.target.value })}
        />
        <span className="text-muted-foreground text-xs shrink-0">—</span>
        <Input
          type="number"
          className="h-9 text-sm"
          placeholder={def.toPlaceholder ?? 'Max'}
          value={current.to}
          onChange={(e) => onChange(columnKey, { ...current, to: e.target.value })}
        />
      </div>
    );
  }

  if (def.type === 'date' && current.type === 'date') {
    const selected = current.value ? new Date(current.value) : undefined;
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn('h-9 w-full justify-start text-sm font-normal', !current.value && 'text-muted-foreground')}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            {current.value ? formatDate(current.value) : (def.placeholder ?? 'Seleccionar fecha')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => onChange(columnKey, { type: 'date', value: date ? date.toISOString().split('T')[0] : '' })}
          />
        </PopoverContent>
      </Popover>
    );
  }

  if (def.type === 'date_range' && current.type === 'date_range') {
    const toISO = (d: Date) => d.toISOString().split('T')[0];
    const today = new Date();

    const presets = [
      {
        label: 'Hoy',
        from: toISO(today),
        to: toISO(today),
      },
      {
        label: 'Ayer',
        from: toISO(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)),
        to: toISO(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)),
      },
      {
        label: '7 días',
        from: toISO(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6)),
        to: toISO(today),
      },
      {
        label: 'Este mes',
        from: toISO(new Date(today.getFullYear(), today.getMonth(), 1)),
        to: toISO(today),
      },
      {
        label: 'Mes pasado',
        from: toISO(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
        to: toISO(new Date(today.getFullYear(), today.getMonth(), 0)),
      },
    ];

    const activePreset = presets.find(p => p.from === current.from && p.to === current.to);

    return (
      <div className="flex flex-col gap-2 w-full">
        {/* Quick presets */}
        <div className="flex flex-wrap gap-1">
          {presets.map(p => (
            <button
              key={p.label}
              onClick={() => onChange(columnKey, { type: 'date_range', from: p.from, to: p.to })}
              className={cn(
                'px-2 py-0.5 rounded text-xs border transition-colors',
                activePreset?.label === p.label
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-input bg-background hover:bg-accent',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom range inputs */}
        <div className="flex items-center gap-1">
          <Input
            type="date"
            className="h-8 text-xs px-2"
            value={current.from}
            onChange={(e) => onChange(columnKey, { ...current, from: e.target.value })}
          />
          <span className="text-muted-foreground text-xs shrink-0">—</span>
          <Input
            type="date"
            className="h-8 text-xs px-2"
            value={current.to}
            onChange={(e) => onChange(columnKey, { ...current, to: e.target.value })}
          />
        </div>
      </div>
    );
  }

  if (def.type === 'datetime' && current.type === 'datetime') {
    return (
      <Input
        type="datetime-local"
        className="h-9 text-sm w-full"
        value={current.value}
        onChange={(e) => onChange(columnKey, { type: 'datetime', value: e.target.value })}
      />
    );
  }

  if (def.type === 'datetime_range' && current.type === 'datetime_range') {
    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{def.fromPlaceholder ?? 'Desde'}</p>
          <Input
            type="datetime-local"
            className="h-9 text-sm"
            value={current.from}
            onChange={(e) => onChange(columnKey, { ...current, from: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{def.toPlaceholder ?? 'Hasta'}</p>
          <Input
            type="datetime-local"
            className="h-9 text-sm"
            value={current.to}
            onChange={(e) => onChange(columnKey, { ...current, to: e.target.value })}
          />
        </div>
      </div>
    );
  }

  if (def.type === 'select' && current.type === 'select') {
    return (
      <Select
        value={current.value || '__all__'}
        onValueChange={(v) => onChange(columnKey, { type: 'select', value: v === '__all__' ? '' : v })}
      >
        <SelectTrigger className="h-9 w-full text-sm">
          <SelectValue placeholder={def.placeholder ?? 'Todos'} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__" className="text-sm text-muted-foreground">
            {def.placeholder ?? 'Todos'}
          </SelectItem>
          {def.options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-sm">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if ((def.type === 'multiselect' || def.type === 'column_values') &&
      (current.type === 'multiselect' || current.type === 'column_values')) {
    return (
      <MultiselectWidget
        options={def.type === 'multiselect' ? def.options : []}
        loadOptions={def.type === 'column_values' ? def.loadOptions : undefined}
        values={current.values}
        onChange={(values) => onChange(columnKey, { type: def.type as 'multiselect' | 'column_values', values })}
      />
    );
  }

  return null;
};
