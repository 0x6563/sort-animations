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

<div class="title flx row spread">
    <div class="signature">
        <h2>Sort Animations</h2>
        <a href="https://github.com/0x6563" target="_blank"> by 0x6563</a>
    </div>
    <div class="setting">
        <Dropdown bind:value={algorithm} options={algorithms} on:select={() => (edited = algorithm)}>
            <div slot="label" let:label class="setting">
                <h3 class="variable">{label ? label : 'Custom'}</h3>
            </div>
            <div slot="option" class="option setting" let:label let:selected class:selected>
                {label}
            </div>
        </Dropdown>
    </div>
    <div class="actions">
        <a class="btn" href="https://github.com/0x6563/sort-animations" target="_blank"><Icon icon="deployed_code" /></a>
        <a class="btn" href="https://www.buymeacoffee.com/0x6563" target="_blank"><Icon icon="coffee" /></a>
        <button class="btn" on:click={Toggle('editor')}><Icon icon="edit" /></button>
        <button class="btn" on:click={Toggle('settings')}><Icon icon="palette" /></button>
        <button class="btn" on:click={Run}><Icon icon="slideshow" /></button>
    </div>
</div>
<div class="content flx row grow">
    <div class="left flx grow column">
        <div class="animation grow">
            {#if animations}
                <SortAnimation bind:this={svg} {animations} />
            {/if}
            {#if error}
                <div class="error">{error}</div>
            {/if}
        </div>
        <div class="footer flx">
            <button class="btn" on:click={svg.Save}><Icon icon="download" /></button>
        </div>
    </div>
    <div class="right flx grow column" data-show={side}>
        {#if side == 'editor'}
            <Delay wait={250}>
                <div class="flx grow column">
                    <Code bind:value={edited} language="javascript" {typings} />
                </div>
                <div class="footer">
                    <div class="flx">
                        For help please visit: <a href="https://github.com/0x6563/sort-animations/issues">GitHub Issues</a>
                    </div>
                </div>
            </Delay>
        {/if}
        {#if side == 'settings'}
            <Settings settings={config.settings} on:refresh={Run} />
        {/if}
    </div>
</div>
<Modal />

<style lang="scss">
    h2 {
        display: inline-block;
        margin: auto;
    }
    h3 {
        margin: 0;
        width: 300px;
        text-align: center;
        padding: 10px 0;
        border-bottom: solid 2px var(--light-accent);
    }
    .signature {
        padding-left: 16px;
        a {
            font-size: 0.75em;
            color: var(--light-stroke);
            font-style: italic;
        }
    }
    .signature,
    .actions,
    .setting {
        width: 300px;
    }
    .actions {
        padding-right: 16px;
    }
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
            box-sizing: content-box;
            height: 100%;
            & > * {
                flex: 1 1 auto;
            }
            & > h1 {
                flex: 0 0 auto;
            }
        }
    }
    .pad {
        padding: 24px 0;
        box-sizing: border-box;
    }
    .right[data-show=''] {
        width: 0 !important;
    }
    .content {
        width: 100%;
    }
    .title,
    .footer {
        height: 50px;
        .setting {
            background: var(--fill);
            :global(.container) {
                background: var(--fill);
                position: absolute;
                top: 0;
                z-index: 1000;
            }
        }
    }
    .footer {
        display: flex;
        align-items: center;
    }
    .option.selected {
        color: var(--light-accent);
    }
    .btn img {
        height: 16px;
        vertical-align: middle;
    }
    .btn {
        display: inline-block;
        min-width: 20px;
        text-align: center;
        padding: 1px 6px;
    }
</style>
