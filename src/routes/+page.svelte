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
    import Code from '@components/code.svelte';
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
    let error;
    let maxNumbers = 20;
    let algorithm = algorithms.BubbleSort;
    let edited = algorithm;
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
            error = undefined;
            starting = true;
            if (worker) {
                await worker.resolve();
            }
            starting = false;
            sorting = true;
            worker = WorkerPromise(SortWorker, { array: Generate(), algorithm });
            const value = await worker.value;
            log = value?.log;
        } catch (e) {
            console.log(e);
            error = (e as Error).message;
        }
        worker = undefined;
        sorting = false;


    }
    function Run() {
        (algorithms as any).Custom = edited;
        algorithm = edited;
        Sort();
    }
    function Generate() {
        return Array.from({ length: maxNumbers }).map(() => 1 + Math.floor(Math.random() * (maxNumbers / 2)));
    }
</script>

<div class="topbar flx row grow">
    <div class="left flx grow">
        <div class="animation grow">
            {#if log}
                <SortAnimation bind:this={svg} {log} {settings} />
            {/if}
            {#if error}
                <div class="error">{error}</div>
            {/if}
        </div>
    </div>
    <div class="editor grow">
        <Code bind:value={edited} language="javascript" />
    </div>
</div>
<div class="botbar flx row spread">
    <div class="setting">
        <Dropdown bind:value={algorithm} options={algorithms} on:select={() => (edited = algorithm)}>
            <div slot="label" let:label class="flx row spread">
                <span class="variable">{label}</span>
            </div>
            <div slot="option" class="option" let:label let:selected class:selected>
                {label}
            </div>
        </Dropdown>
    </div>
    <button class="btn" on:click={svg.Save}><Icon icon="download" /></button>
    <button class="btn" on:click={Run}><Icon icon="slideshow" /></button>
    <button class="btn" on:click={() => Sort()}><Icon icon="refresh" /></button>
</div>

<style lang="scss">
    .left {
        min-width: 50%;
    }
    .animation {
        margin: auto;
        aspect-ratio: 2;
        flex: 1 1 auto;
    }
    .editor {
        height: 100%;
    }
    .topbar {
        width: 100%;
    }
    .botbar {
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
