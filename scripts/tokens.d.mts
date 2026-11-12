type Vars = Record<string, string>
export const COLOR_TOKENS: string[]
export const RADIUS_THEME: Vars
export function parseBase(cssText?: string): { light: Vars; dark: Vars; extra: Record<string, unknown> }
export function expectedItemCss(parsed: { extra: Record<string, unknown> }): Record<string, unknown>
export function expectedThemeVars(): Vars
