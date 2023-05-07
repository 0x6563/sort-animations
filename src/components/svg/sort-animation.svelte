<script lang="ts">
    import type { WorkspaceAnimation } from '@services/workspace/animation';
    import Animate from './animate.svelte';

    export let animations: WorkspaceAnimation;

    let svg: SVGElement;

    function CleanClass(node: SVGElement) {
        node.classList.forEach((e) => {
            if (e.startsWith('s-')) node.classList.remove(e);
        });
        if (node.classList.length == 0) {
            node.removeAttribute('class');
        }
    }

    export function Save() {
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        const svgData = svg.outerHTML;
        const preface = '<?xml version="1.0" standalone="no"?>\r\n';
        const svgBlob = new Blob([preface, svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = svgUrl;
        downloadLink.download = 'sort.svg';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
</script>

{#if animations}
    {@const { graph, cell, column, background } = animations.layout.settings}
    <svg bind:this={svg} viewBox={animations.current.viewbox} fill={background.fill}>
        <defs use:CleanClass>
            <symbol id="array" viewBox={`0 0 ${graph.outerWidth} ${graph.outerHeight}`} preserveAspectRatio="xMidYMid meet">
                {#if graph.corner}
                    {@const cWidth = graph.outerWidth * graph.corner.width}
                    {@const cHeight = graph.outerHeight * graph.corner.height}
                    <path id="corner-tl" d={`M 0 ${cHeight} L 0 0 L ${cWidth} 0`} fill="none" stroke={graph.fill} stroke-width={graph.corner.stroke} />
                    <path id="corner-tr" d={`M ${graph.outerWidth - cWidth} 0 L ${graph.outerWidth} 0 L ${graph.outerWidth} ${cHeight}`} fill="none" stroke={graph.fill} stroke-width={graph.corner.stroke} />
                    <path id="corner-bl" d={`M 0 ${graph.outerHeight - cHeight} L 0 ${graph.outerHeight}  L ${cWidth} ${graph.outerHeight} `} fill="none" stroke={graph.fill} stroke-width={graph.corner.stroke} />
                    <path id="corner-br" d={`M ${graph.outerWidth - cWidth} ${graph.outerHeight} L ${graph.outerWidth} ${graph.outerHeight} L ${graph.outerWidth}  ${graph.outerHeight - cHeight}`} fill="none" stroke={graph.fill} stroke-width={graph.corner.stroke} />
                {:else}
                    <rect x="0" y="0" width={graph.outerWidth} height={graph.outerHeight} rx={graph.radius} ry={graph.radius} stroke="none" use:CleanClass />
                {/if}
            </symbol>
            <symbol id="column" width={cell.width} viewBox={`0 0 ${cell.width} ${column.height}`} preserveAspectRatio="xMinYMax slice" use:CleanClass>
                {#each { length: animations.stats.value.maxValue } as a, i}
                    <rect x="0" y={i * cell.outerHeight} width={cell.width} height={cell.height} rx={cell.radius} ry={cell.radius} use:CleanClass />
                {/each}
            </symbol>
        </defs>
        <rect width="100%" height="100%" fill={background.fill} />
        {#each animations.current.elements as ref}
            {#if ref.type == 'array'}
                <use id={`ref-${ref.id}`} href="#array" x={-100} opacity={0} height={graph.outerHeight} width={graph.outerWidth} use:CleanClass />
            {/if}
        {/each}
        {#each animations.current.elements as ref}
            {#if ref.type == 'value'}
                <use id={`ref-${ref.id}`} href="#column" height={ref.dimensions.height} x={-100} y={-100} opacity={0} use:CleanClass />
            {/if}
        {/each}
        <Animate animations={animations.animations} />
        <!-- Animations by https://0x6563.github.io/sort-animations -->
    </svg>
{/if}

<style lang="scss">
    svg {
        display: block;
        margin: auto;
        height: 100%;
        width: 100%;
    }
</style>
