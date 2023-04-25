<script lang="ts">
    import { WorkspaceAnimation, type SVGConfigInput } from '@services/workspace/animation';
    import Animate from './animate.svelte';
    import type { EventLogEvent } from '@services/workspace/eventlog';

    export let log: EventLogEvent[];
    export let settings: SVGConfigInput;
    let svg: SVGElement;
    let animations: WorkspaceAnimation;
    $: {
        animations = new WorkspaceAnimation(log, settings);
    }

    function CleanClass(node: SVGElement) {
        node.classList.forEach((e) => {
            if (e.startsWith('s-')) node.classList.remove(e);
        });
        if (node.classList.length == 0) {
            // node.removeAttribute('class');
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
    {@const { graph, cell, column, background } = animations.settings}
    <svg bind:this={svg} viewBox={animations.current.viewbox} fill={background.fill}>
        <defs use:CleanClass>
            <rect id="array" height={graph.outerHeight} width={graph.outerWidth} rx={graph.radius} ry={graph.radius} fill={graph.fill} use:CleanClass />
            <symbol id="column" width={cell.width} viewBox={`0 0 ${cell.width} ${column.height}`} preserveAspectRatio="xMinYMax slice" use:CleanClass>
                <rect x="0" y="0" width={cell.width} height={column.height} fill={column.fill} use:CleanClass />
                {#each { length: animations.stats.value.maxValue } as a, i}
                    <rect x="0" y={i * cell.outerHeight} width={cell.width} height={cell.height} rx={cell.radius} ry={cell.radius} use:CleanClass />
                {/each}
            </symbol>
        </defs>
        {#each animations.current.references as ref}
            {#if ref.type == 'array'}
                <use id={`ref-${ref.id}`} href="#array" x={-100} opacity={0} use:CleanClass />
            {/if}
        {/each}
        {#each animations.current.references as ref}
            {#if ref.type == 'value'}
                <use id={`ref-${ref.id}`} href="#column" height={ref.dimensions.height} x={-100} y={-100} opacity={0} use:CleanClass />
            {/if}
        {/each}
        <Animate animations={animations.animations} />

        <!-- <use href="#column" id={`value${id}`} {height} x={square * -1} y={(height + graphPadding) * -1} fill="white" use:noClass /> -->
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
