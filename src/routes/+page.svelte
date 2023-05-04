<script context="module" lang="ts">
    import SortWorker from '@services/sorting/worker?worker';
    import types from '@services/workspace/types?raw';
</script>

<script lang="ts">
    import Dropdown from '@components/inputs/dropdown.svelte';
    import Icon from '@components/icon.svelte';
    import SortAnimation from '@components/svg/sort-animation.svelte';
    import { WorkerPromise, type WorkerPromiseResult } from '@services/worker-runner';
    import Code from '@components/inputs/code.svelte';
    import { SortMethods } from '@services/sorting/methods';
    import Modal from '@components/modal.svelte';
    import Settings from '@components/settings.svelte';
    import { SVGLayout } from '@services/workspace/settings';
    import Delay from '@components/delay.svelte';
    import { WorkspaceAnimation } from '@services/workspace/animation';
    const algorithms = SortMethods;
    const typings = {
        workspace: types.split('//---//')[0],
    };
    const config: any = { settings: { svg: SVGLayout } };
    let error;
    let side: '' | 'editor' | 'settings' = '';
    let maxNumbers = 20;
    let algorithm = algorithms.BubbleSort;
    let edited = algorithm;
    let worker: undefined | WorkerPromiseResult;
    let starting = false;
    let sorting = false;
    let event;
    let animations: WorkspaceAnimation | undefined;
    let svg: SortAnimation;
    $: event = { maxNumbers, algorithm } && Sort();
    let stats;
    async function Sort() {
        if (starting) {
            return;
        }
        try {
            animations = undefined;
            error = undefined;
            starting = true;
            if (worker) {
                await worker.resolve();
            }
            starting = false;
            sorting = true;
            worker = WorkerPromise(SortWorker, { array: Generate(), algorithm });
            const value = await worker.value;
            const log = value?.log;
            if (log) {
                animations = new WorkspaceAnimation(log, config.settings.svg);
            }
        } catch (e) {
            console.log(e);
            error = (e as Error).message;
        }
        worker = undefined;
        sorting = false;
    }
    function Run() {
        algorithm = edited;
        Sort();
    }
    function Generate() {
        return Array.from({ length: maxNumbers }).map(() => 1 + Math.floor(Math.random() * (maxNumbers / 2)));
    }
    function Toggle(show) {
        return () => {
            if (side == show) {
                side = '';
            } else {
                side = show;
            }
        };
    }
</script>

<div class="topbar flx row grow">
    <div class="left flx grow">
        <div class="animation grow">
            {#if animations}
                <SortAnimation bind:this={svg} {animations} />
            {/if}
            {#if error}
                <div class="error">{error}</div>
            {/if}
        </div>
    </div>
    <div class="right grow" data-show={side}>
        {#if side == 'editor'}
            <Delay wait={250}>
                <div class="flx grow column">
                    <h1>Custom</h1>
                    <Code bind:value={edited} language="javascript" {typings} />
                </div>
            </Delay>
        {/if}
        {#if side == 'settings'}
            <Settings settings={config.settings} />
        {/if}
    </div>
</div>
<div class="botbar flx row spread">
    <div class="setting">
        <Dropdown bind:value={algorithm} options={algorithms} on:select={() => (edited = algorithm)}>
            <div slot="label" let:label class="flx row spread">
                <span class="variable">{label ? label : 'Custom'}</span>
            </div>
            <div slot="option" class="option" let:label let:selected class:selected>
                {label}
            </div>
        </Dropdown>
    </div>
    <button class="btn" on:click={Toggle('editor')}><Icon icon="edit" /></button>
    <button class="btn" on:click={Toggle('settings')}><Icon icon="settings" /></button>
    <button class="btn" on:click={svg.Save}><Icon icon="download" /></button>
    <button class="btn" on:click={Run}><Icon icon="slideshow" /></button>
</div>
<Modal />

<style lang="scss">
    .left {
        min-width: 50%;
    }
    .animation {
        flex: 1 1 auto;
        margin: auto;
        aspect-ratio: 2;
    }
    .right {
        height: 100%;
        transition: all 200ms;
        & > .flx {
            height: 100%;
            & > * {
                flex: 1 1 auto;
            }
            & > h1 {
                flex: 0 0 auto;
            }
        }
    }
    .right[data-show=''] {
        width: 0 !important;
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
