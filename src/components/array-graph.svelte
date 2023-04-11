<script context="module" lang="ts">
    import SortWorker from '@services/sort-worker?worker';
    declare const SortMethods;
</script>

<script lang="ts">
    import { Workspace, type HistoryItem } from '@services/workspace';
    import { onMount } from 'svelte';

    export let array: number[] = [];
    export let algorithm: string = SortMethods.BubbleSort;

    let square = 20;
    let radius = 2;
    let cellMargin = 1;
    let graphMargin = 12;
    let graphPadding = 12;
    let css = 'red';
    let columns = 3;
    let comp1: Item | undefined;
    let comp2: Item | undefined;

    let max: number = array.reduce((a, c) => Math.max(a, c), 0);
    let fullsquare = square + cellMargin * 2;
    let graphHeight = fullsquare * max + graphMargin * 2;
    let graphWidth = fullsquare * array.length + graphMargin * 2;
    let fullGraphHeight = graphHeight + graphPadding * 2;
    let fullGraphWidth = graphWidth + graphPadding * 2;

    let workspace: Workspace = new Workspace([]);
    let animation: Promise<void> | undefined;
    let worker: { value: Promise<any>; kill: () => void } | undefined;
    let event;

    interface Item {
        $: number;
        index: number;
        value: number;
        list: number;
    }

    let sorting = false;
    let starting = false;
    let animating = false;
    $: event = { array, algorithm } && Sort();
    onMount(() => {
        Sort();
    });

    async function Sort() {
        if (starting) {
            return;
        }
        try {
            starting = true;
            await Promise.all([CancelWorker(), CancelAnimation()]);
            starting = false;
            Recalculate();
            sorting = true;
            worker = RunWorker();
            const { history, array } = await worker.value;
            worker = undefined;
            animation = Animate(history, array);
            await animation;
            animation = undefined;
            sorting = false;
        } catch (error) {
            console.log(error);
        }
    }

    function Recalculate() {
        max = array.reduce((a, c) => Math.max(a, c), 0);
        fullsquare = square + cellMargin * 2;
        graphHeight = fullsquare * max + graphMargin * 2;
        graphWidth = fullsquare * array.length + graphMargin * 2;
        fullGraphHeight = graphHeight + graphPadding * 2;
        fullGraphWidth = graphWidth + graphPadding * 2;
    }

    async function CancelWorker() {
        if (worker) {
            try {
                const { value } = worker;
                worker.kill();
                await value;
            } catch (error) {}
        }
    }

    async function CancelAnimation() {
        try {
            if (animating) {
                animating = false;
                await animation;
            }
        } catch (error) {}
    }

    function RunWorker() {
        const worker = new SortWorker();
        let resolve;
        let reject;
        const value: Promise<any> = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        worker.addEventListener('message', (r) => {
            resolve(r.data);
            console.log('Recieved');
            console.log(r.data);
        });
        worker.addEventListener('error', (e) => {
            reject(e);
            console.log('Worker ERROR');
        });
        worker.addEventListener('messageerror', (e) => {
            reject(e);
        });
        console.log({array, algorithm})
        worker.postMessage({ array, algorithm });
        return {
            value,
            kill() {
                worker.terminate();
                reject();
            },
        };
    }

    async function Animate(history: HistoryItem[], array: number[]) {
        workspace = new Workspace(array);
        animating = true;

        comp1 = undefined;
        comp2 = undefined;
        await Wait(2000);

        let delay = false;
        for (const h of history) {
            if (!animating) {
                throw Error('Animation Interrupted');
            }
            workspace.replay(h);

            if (h.operation === 'noanimate') {
                delay = true;
            }
            if (h.operation === 'animate') {
                delay = false;
            }
            if (h.operation === 'compare') {
                comp1 = workspace.getItem(h.arguments.a);
                comp2 = workspace.getItem(h.arguments.b);
            }
            if (h.operation === 'unhighlight') {
                comp1 = undefined;
                comp2 = undefined;
            }
            if (!delay && ['animate', 'unhighlight', 'compare', 'move', 'swap', 'reindex'].includes(h.operation)) {
                await Wait(500);
                workspace = workspace;
            }
        }
        animating = false;
        workspace = workspace;
        comp1 = undefined;
        comp2 = undefined;
    }

    function ItemTranslation(a: Item) {
        const x = GetListCol(a.list) * fullGraphWidth + graphMargin + graphPadding;
        const y = GetListRow(a.list) * fullGraphHeight - graphMargin - graphPadding;
        const offset = a.index * fullsquare;
        return `translate(${x + offset} ${y})`;
    }
    function GraphTranslation(n: number) {
        const x = GetListCol(n) * fullGraphWidth + graphMargin;
        const y = GetListRow(n) * fullGraphHeight + graphMargin;
        return `translate(${x} ${y})`;
    }

    function ViewBox(workspace: Workspace) {
        const l = workspace.lists.length;
        const x = Math.min(l, columns) * fullGraphWidth;
        const y = (GetListRow(l) + 1) * fullGraphHeight;
        return `0 0 ${x} ${y}`;
    }

    function GetListCol(n: number) {
        return n % columns;
    }

    function GetListRow(n: number) {
        return Math.floor(n / columns);
    }

    function Wait(ms: number) {
        return new Promise((res) => {
            setTimeout(res, ms);
        });
    }
</script>

{#if workspace.main.length}
    <svg class={css} viewBox={ViewBox(workspace)}>
        {#each workspace.lists as _, i}
            <rect class="graph" x="0" y="0" height={graphHeight} width={graphWidth} transform={GraphTranslation(i)} rx={radius} ry={radius} />
        {/each}
        {#each workspace.main as a}
            <g class="column" class:compared={comp1 == a || comp2 == a} x="0" y="0" transform={ItemTranslation(a)}>
                {#each { length: a.value } as _, i}
                    <rect class="cell" x={cellMargin} y={fullGraphHeight - (i + 1) * fullsquare} height={square} width={square} rx={radius} ry={radius} />
                {/each}
            </g>
        {/each}
    </svg>
{/if}
{#if sorting}
    <h2>Sorting</h2>
{:else}
    <h2>Done!</h2>
{/if}

<style lang="scss">
    svg {
        display: block;
        margin: auto;
        transition: all 200ms;
        height: 100%;
        width: 100%;
        .graph {
            transform: translate(0 0);
            transition: all 200ms;
            fill: var(--light-fill);
        }

        g.column {
            transform: translate(0 0);
            transition: all 200ms;
            .cell {
                fill: var(--light-stroke);
                transition: all 200ms;
            }
            &.compared {
                .cell {
                    fill: var(--accent);
                }
            }
        }
    }
</style>
