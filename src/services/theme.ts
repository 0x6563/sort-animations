import { writable } from 'svelte/store';

function getStyle(querySelector: string, style: string) {
    const node = document.querySelector(querySelector);
    if (!node)
        return '';
    return window.getComputedStyle(node).getPropertyValue(style);
}

export const GetStyle = typeof window != 'undefined' ? getStyle : (querySelector: string, style: string) => '';

export const Theme = writable<'light' | 'dark'>();
export const Style = {
    accent: '',
    lightAccent: '',
    darkAccent: '',
    accent2: '',
    accent2Light: '',
    accent2Dark: '',
    fill: '',
    lightFill: '',
    lightStroke: '',
    stroke: '',
};

Theme.subscribe(v => RefreshStyle());

export function RefreshStyle() {
    Style.accent = GetStyle('#swatch .accent', 'color');
    Style.lightAccent = GetStyle('#swatch .light-accent', 'color');
    Style.darkAccent = GetStyle('#swatch .dark-accent', 'color');
    Style.accent2 = GetStyle('#swatch .accent2', 'color');
    Style.accent2Light = GetStyle('#swatch .accent2-light', 'color');
    Style.accent2Dark = GetStyle('#swatch .accent2-dark', 'color');
    Style.fill = GetStyle('#swatch .fill', 'color');
    Style.lightFill = GetStyle('#swatch .light-fill', 'color');
    Style.lightStroke = GetStyle('#swatch .light-stroke', 'color');
    Style.stroke = GetStyle('#swatch .stroke', 'color');
}