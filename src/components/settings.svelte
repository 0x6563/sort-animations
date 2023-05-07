<script lang="ts">
    import type { SVGConfigInput } from '@services/workspace/animation';
    import Number from './inputs/number.svelte';
    import Color from './inputs/color.svelte';
    import { createEventDispatcher } from 'svelte';
    import Icon from './icon.svelte';
    export let settings: { svg: SVGConfigInput };
    const dispatch = createEventDispatcher();
    function Refresh() {
        dispatch('refresh');
    }
    let height = settings.svg.border.height * 200;
    let width = settings.svg.border.width * 200;
    $: settings.svg.border.height = height / 200;
    $: settings.svg.border.width = width / 200;
</script>

<div class="settings">
    <div class="section">
        <h4>SVG</h4>
        <Color label="Background" bind:value={settings.svg.background.fill} />
    </div>
    <div class="section">
        <h4>Graph</h4>
        <Color label="Background" bind:value={settings.svg.graph.fill} />
        <Color label="Tint" bind:value={settings.svg.graph.tint} />
        <Color label="Shade" bind:value={settings.svg.graph.shade} />
        <Color label="Highlight" bind:value={settings.svg.graph.highlight} />
        <br />

        <Number label="Radius" bind:value={settings.svg.graph.radius} />
        <Number label="Margin" bind:value={settings.svg.graph.margin} />
        <Number label="Padding" bind:value={settings.svg.graph.padding} />
    </div>
    <div class="section">
        <h4>Border</h4>
        <Color label="Color" bind:value={settings.svg.border.fill} />
        <Color label="Tint" bind:value={settings.svg.border.tint} />
        <Color label="Shade" bind:value={settings.svg.border.shade} />
        <Color label="Highlight" bind:value={settings.svg.border.highlight} />
        <br />

        <Number label="Height %" bind:value={height} min={0} max={100} />
        <Number label="Width %" bind:value={width} min={0} max={100} />
        <Number label="Thickness" bind:value={settings.svg.border.thickness} />
    </div>
    <div class="section">
        <h4>Cell</h4>
        <Color label="Background" bind:value={settings.svg.cell.fill} />
        <Color label="Tint" bind:value={settings.svg.cell.tint} />
        <Color label="Shade" bind:value={settings.svg.cell.shade} />
        <Color label="Highlight" bind:value={settings.svg.cell.highlight} />
        <br />
        <Number label="Radius" bind:value={settings.svg.cell.radius} />
        <Number label="Margin" bind:value={settings.svg.cell.margin} />
        <Number label="Height" bind:value={settings.svg.cell.height} />
        <Number label="Width" bind:value={settings.svg.cell.width} />
    </div>
    <div class="section">
        <button on:click={Refresh}> <Icon icon="brush" /></button>
    </div>
</div>

<style lang="scss">
    .settings {
        padding: 24px;
        text-align: center;
        width: 100%;
        overflow: auto;
    }
    button {
        background: none;
        color: var(--stroke);
        font-weight: 600;
        font-size: 24px;
        outline: none;
        border: none;
    }
</style>
