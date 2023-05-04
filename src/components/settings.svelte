<script lang="ts">
    import type { SVGConfigInput } from '@services/workspace/animation';
    import Number from './inputs/number.svelte';
    import Color from './inputs/color.svelte';
    export let settings: { svg: SVGConfigInput };
</script>

<div class="settings">
    <div class="section">
        <h4>SVG</h4>
        <Color label="Fill" bind:value={settings.svg.background.fill} />
    </div>
    <div class="section">
        <h4>Graph</h4>
        <Color label="Fill" bind:value={settings.svg.graph.fill} />
        <Color label="Tint" bind:value={settings.svg.graph.tint} />
        <Color label="Shade" bind:value={settings.svg.graph.shade} />
        <Color label="Highlight" bind:value={settings.svg.graph.highlight} />
        <br />

        <Number label="Radius" bind:value={settings.svg.graph.radius} />
        <Number label="Margin" bind:value={settings.svg.graph.margin} />
        <Number label="Padding" bind:value={settings.svg.graph.padding} />
    </div>
    <div class="section">
        <h4>Cell</h4>
        <Color label="Fill" bind:value={settings.svg.cell.fill} />
        <Color label="Tint" bind:value={settings.svg.cell.tint} />
        <Color label="Shade" bind:value={settings.svg.cell.shade} />
        <Color label="Highlight" bind:value={settings.svg.cell.highlight} />
        <br />
        <Number label="Radius" bind:value={settings.svg.cell.radius} />
        <Number label="Margin" bind:value={settings.svg.cell.margin} />
        <Number label="Height" bind:value={settings.svg.cell.height} />
        <Number label="Width" bind:value={settings.svg.cell.width} />
    </div>
</div>

<style lang="scss">
    .settings {
        padding: 24px;
        text-align: center;
    }
</style>
