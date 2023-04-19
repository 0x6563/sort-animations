<script context="module" lang="ts">
    import SortWorker from '@services/sort-worker?worker';
    import type { SortMethods as Algo } from '@services/sort-methods';
    declare const SortMethods: { SortMethods: typeof Algo };
</script>

<script lang="ts">
    import Dropdown from '@components/dropdown.svelte';
    import Icon from '@components/icon.svelte';
    import SortAnimation from '@components/svg/sort-animation.svelte';
    import type { EventLogEvent } from '@services/workspace/eventlog';
    import { WorkerPromise, type WorkerPromiseResult } from '@services/worker-runner';
    import type { SVGConfigInput } from '@services/workspace/animation';

    const { SortMethods: algorithms } = SortMethods;
    const settings: SVGConfigInput = {
        background: {
            fill: '',
        },
        cell: {
            size: 20,
            fill: '#AAA',
            highlight: 'red',
            radius: 4,
            margin: 4,
        },
        column: {
            fill: '',
            highlight: '',
        },
        graph: {
            radius: 4,
            margin: 12,
            padding: 12,
            fill: '#333',
            highlight: 'red',
        },
    };

    let maxNumbers = 20;
    let algorithm = algorithms.NaiveQuickSort;
    let worker: undefined | WorkerPromiseResult;
    let starting = false;
    let sorting = false;
    let event;
    let log: undefined | EventLogEvent[];
    let svg: SortAnimation;
    $: event = { maxNumbers, algorithm } && Sort();
    let stats;

    async function Sort() {
        if (starting) {
            return;
        }
        try {
            log = undefined;
            starting = true;
            if (worker) {
                await worker.resolve();
            }
            starting = false;
            sorting = true;
            worker = WorkerPromise(SortWorker, { array: Generate(), algorithm });
            const value = await worker.value;
            worker = undefined;
            log = value.log;
            sorting = false;
        } catch (error) {
            console.log(error);
        }
    }

    function Generate() {
        return Array.from({ length: maxNumbers }).map(() => 1 + Math.floor(Math.random() * (maxNumbers / 2)));
    }
</script>

<div id="app" class="dark">
    {#if log}
        <div class="container grow">
            <SortAnimation bind:this={svg} {log} {settings} />
        </div>
    {/if}
    <div class="botbar flx row spread">
        <div class="setting">
            <Dropdown bind:value={algorithm} options={algorithms}>
                <div slot="label" let:label class="flx row spread">
                    <span class="variable">{label}</span>
                </div>
                <div slot="option" class="option" let:label let:selected class:selected>
                    {label}
                </div>
            </Dropdown>
        </div>
        <button class="btn" on:click={svg.Save}><Icon icon="download" /></button>
        <button class="btn" on:click={() => Sort()}><Icon icon="refresh" /></button>
    </div>
</div>

<style lang="scss">
    #app {
        display: flex;
    }
    .container {
        margin: auto;
        max-height: calc(90vmin - 50px);
        aspect-ratio: 2;
        flex: 1 1 auto;
    }
    .botbar {
        position: fixed;
        bottom: 0;
        z-index: 100;
        height: 50px;
        .setting {
            background: var(--fill);
            :global(.container) {
                background: var(--fill);
                position: absolute;
                bottom: 0;
                padding: 12px;
            }
        }
    }
    .option.selected {
        color: var(--light-accent);
    }
</style>
