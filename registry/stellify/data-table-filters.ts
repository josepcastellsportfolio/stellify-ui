// StellifyitFilters — filter type system for DataGrid
// Single source of truth for all filter types, operators, state shapes, and factory helpers.

// ── Operators ──────────────────────────────────────────────────────────────────

export type StringOperator = 'contains' | 'equals' | 'starts_with' | 'ends_with';
export type NumberOperator = 'eq' | 'lt' | 'lte' | 'gt' | 'gte';

export const STRING_OPERATOR_LABELS: Record<StringOperator, string> = {
  contains:    'Contiene',
  equals:      'Igual a',
  starts_with: 'Empieza por',
  ends_with:   'Termina en',
};

export const NUMBER_OPERATOR_LABELS: Record<NumberOperator, string> = {
  eq:  '=',
  lt:  '<',
  lte: '≤',
  gt:  '>',
  gte: '≥',
};

// ── Select option ───────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
}

// ── Filter definitions (declared in column config) ─────────────────────────────

export type FilterDef =
  | StringFilterDef
  | NumberFilterDef
  | NumberRangeFilterDef
  | DateFilterDef
  | DateRangeFilterDef
  | DatetimeFilterDef
  | DatetimeRangeFilterDef
  | SelectFilterDef
  | MultiselectFilterDef
  | ColumnValuesFilterDef;

export interface StringFilterDef {
  type: 'string';
  defaultOperator?: StringOperator;
  operators?: StringOperator[];
  placeholder?: string;
}

export interface NumberFilterDef {
  type: 'number';
  defaultOperator?: NumberOperator;
  operators?: NumberOperator[];
  placeholder?: string;
}

export interface NumberRangeFilterDef {
  type: 'number_range';
  fromPlaceholder?: string;
  toPlaceholder?: string;
}

export interface DateFilterDef {
  type: 'date';
  placeholder?: string;
}

export interface DateRangeFilterDef {
  type: 'date_range';
  fromPlaceholder?: string;
  toPlaceholder?: string;
}

export interface DatetimeFilterDef {
  type: 'datetime';
  placeholder?: string;
}

export interface DatetimeRangeFilterDef {
  type: 'datetime_range';
  fromPlaceholder?: string;
  toPlaceholder?: string;
}

export interface SelectFilterDef {
  type: 'select';
  options: SelectOption[];
  placeholder?: string;
}

export interface MultiselectFilterDef {
  type: 'multiselect';
  options: SelectOption[];
  placeholder?: string;
}

export interface ColumnValuesFilterDef {
  type: 'column_values';
  loadOptions: () => Promise<SelectOption[]>;
  placeholder?: string;
}

// ── Active filter values (stored in useDataGrid state) ─────────────────────────

export type ActiveFilterValue =
  | { type: 'string'; value: string; operator: StringOperator }
  | { type: 'number'; value: string; operator: NumberOperator }
  | { type: 'number_range'; from: string; to: string }
  | { type: 'date'; value: string }
  | { type: 'date_range'; from: string; to: string }
  | { type: 'datetime'; value: string }
  | { type: 'datetime_range'; from: string; to: string }
  | { type: 'select'; value: string }
  | { type: 'multiselect'; values: string[] }
  | { type: 'column_values'; values: string[] };

export type ActiveFilters = Record<string, ActiveFilterValue>;

// ── Type guard helpers ─────────────────────────────────────────────────────────

export function isStringFilter(f: ActiveFilterValue | undefined): f is Extract<ActiveFilterValue, { type: 'string' }> {
  return !!f && f.type === 'string';
}

export function isNumberFilter(f: ActiveFilterValue | undefined): f is Extract<ActiveFilterValue, { type: 'number' }> {
  return !!f && f.type === 'number';
}

export function isNumberRangeFilter(f: ActiveFilterValue | undefined): f is Extract<ActiveFilterValue, { type: 'number_range' }> {
  return !!f && f.type === 'number_range';
}

export function isDateFilter(f: ActiveFilterValue | undefined): f is Extract<ActiveFilterValue, { type: 'date' }> {
  return !!f && f.type === 'date';
}

export function isDateRangeFilter(f: ActiveFilterValue | undefined): f is Extract<ActiveFilterValue, { type: 'date_range' }> {
  return !!f && f.type === 'date_range';
}

export function isDatetimeFilter(f: ActiveFilterValue | undefined): f is Extract<ActiveFilterValue, { type: 'datetime' }> {
  return !!f && f.type === 'datetime';
}

export function isDatetimeRangeFilter(f: ActiveFilterValue | undefined): f is Extract<ActiveFilterValue, { type: 'datetime_range' }> {
  return !!f && f.type === 'datetime_range';
}

export function isSelectFilter(f: ActiveFilterValue | undefined): f is Extract<ActiveFilterValue, { type: 'select' }> {
  return !!f && f.type === 'select';
}

export function isMultiselectFilter(f: ActiveFilterValue | undefined): f is Extract<ActiveFilterValue, { type: 'multiselect' }> {
  return !!f && f.type === 'multiselect';
}

export function isColumnValuesFilter(f: ActiveFilterValue | undefined): f is Extract<ActiveFilterValue, { type: 'column_values' }> {
  return !!f && f.type === 'column_values';
}

// ── Check if a filter has an active value ──────────────────────────────────────

export function isFilterActive(filter: ActiveFilterValue | undefined): boolean {
  if (!filter) return false;
  switch (filter.type) {
    case 'string':
      return filter.value.trim().length > 0;
    case 'number':
      return filter.value.trim().length > 0;
    case 'number_range':
      return filter.from.trim().length > 0 || filter.to.trim().length > 0;
    case 'date':
    case 'datetime':
      return filter.value.trim().length > 0;
    case 'date_range':
    case 'datetime_range':
      return filter.from.trim().length > 0 || filter.to.trim().length > 0;
    case 'select':
      return filter.value.trim().length > 0;
    case 'multiselect':
    case 'column_values':
      return filter.values.length > 0;
  }
}

// ── Human-readable summary of an active filter ────────────────────────────────

/**
 * Short text for the chip that shows a filter is applied.
 *
 * The chip has to say what is being filtered without the column popover
 * being open, so this renders values rather than operators wherever the
 * operator adds nothing: "Contiene press" reads worse than "press" under a
 * chip already labelled with the column name.
 *
 * `def` supplies the option labels, so a select shows "Completada" and not
 * the `completed` it sends to the API.
 */
export function describeFilter(
  filter: ActiveFilterValue | undefined,
  def?: FilterDef,
): string {
  if (!filter || !isFilterActive(filter)) return '';

  const optionLabel = (value: string): string => {
    const options =
      def && (def.type === 'select' || def.type === 'multiselect')
        ? def.options
        : undefined;
    return options?.find(o => o.value === value)?.label ?? value;
  };

  switch (filter.type) {
    case 'string':
      return filter.operator === 'contains'
        ? filter.value
        : `${STRING_OPERATOR_LABELS[filter.operator]} ${filter.value}`;
    case 'number':
      return `${NUMBER_OPERATOR_LABELS[filter.operator]} ${filter.value}`;
    case 'number_range':
    case 'date_range':
    case 'datetime_range':
      if (filter.from && filter.to) return `${filter.from} — ${filter.to}`;
      return filter.from ? `desde ${filter.from}` : `hasta ${filter.to}`;
    case 'date':
    case 'datetime':
      return filter.value;
    case 'select':
      return optionLabel(filter.value);
    case 'multiselect':
    case 'column_values':
      return filter.values.length === 1
        ? optionLabel(filter.values[0])
        : `${filter.values.length} seleccionados`;
  }
}

// ── Default active filter values per type ─────────────────────────────────────

export function defaultFilterValue(def: FilterDef): ActiveFilterValue {
  switch (def.type) {
    case 'string':
      return { type: 'string', value: '', operator: def.defaultOperator ?? 'contains' };
    case 'number':
      return { type: 'number', value: '', operator: def.defaultOperator ?? 'eq' };
    case 'number_range':
      return { type: 'number_range', from: '', to: '' };
    case 'date':
      return { type: 'date', value: '' };
    case 'date_range':
      return { type: 'date_range', from: '', to: '' };
    case 'datetime':
      return { type: 'datetime', value: '' };
    case 'datetime_range':
      return { type: 'datetime_range', from: '', to: '' };
    case 'select':
      return { type: 'select', value: '' };
    case 'multiselect':
      return { type: 'multiselect', values: [] };
    case 'column_values':
      return { type: 'column_values', values: [] };
  }
}

// ── Factory helpers (use in column config files) ───────────────────────────────
//
// Usage:
//   filter: Filters.string({ placeholder: 'Buscar descripción...' })
//   filter: Filters.dateRange()
//   filter: Filters.numberRange({ fromPlaceholder: 'Min €', toPlaceholder: 'Max €' })
//   filter: Filters.select(categories.map(c => ({ value: String(c.id), label: c.name })))

const ALL_STRING_OPERATORS: StringOperator[] = ['contains', 'equals', 'starts_with', 'ends_with'];
const ALL_NUMBER_OPERATORS: NumberOperator[] = ['eq', 'lt', 'lte', 'gt', 'gte'];

export const Filters = {
  string(opts?: Partial<StringFilterDef>): StringFilterDef {
    return {
      type: 'string',
      defaultOperator: 'contains',
      operators: ALL_STRING_OPERATORS,
      ...opts,
    };
  },

  number(opts?: Partial<NumberFilterDef>): NumberFilterDef {
    return {
      type: 'number',
      defaultOperator: 'eq',
      operators: ALL_NUMBER_OPERATORS,
      ...opts,
    };
  },

  numberRange(opts?: Partial<NumberRangeFilterDef>): NumberRangeFilterDef {
    return {
      type: 'number_range',
      fromPlaceholder: 'Min',
      toPlaceholder: 'Max',
      ...opts,
    };
  },

  date(opts?: Partial<DateFilterDef>): DateFilterDef {
    return { type: 'date', ...opts };
  },

  dateRange(opts?: Partial<DateRangeFilterDef>): DateRangeFilterDef {
    return {
      type: 'date_range',
      fromPlaceholder: 'Desde',
      toPlaceholder: 'Hasta',
      ...opts,
    };
  },

  datetime(opts?: Partial<DatetimeFilterDef>): DatetimeFilterDef {
    return { type: 'datetime', ...opts };
  },

  datetimeRange(opts?: Partial<DatetimeRangeFilterDef>): DatetimeRangeFilterDef {
    return {
      type: 'datetime_range',
      fromPlaceholder: 'Desde',
      toPlaceholder: 'Hasta',
      ...opts,
    };
  },

  select(options: SelectOption[], opts?: Partial<SelectFilterDef>): SelectFilterDef {
    return {
      type: 'select',
      options,
      placeholder: 'Todos',
      ...opts,
    };
  },

  multiselect(options: SelectOption[], opts?: Partial<MultiselectFilterDef>): MultiselectFilterDef {
    return {
      type: 'multiselect',
      options,
      placeholder: 'Seleccionar...',
      ...opts,
    };
  },

  columnValues(loadOptions: () => Promise<SelectOption[]>, opts?: Partial<ColumnValuesFilterDef>): ColumnValuesFilterDef {
    return {
      type: 'column_values',
      loadOptions,
      placeholder: 'Seleccionar...',
      ...opts,
    };
  },
};
