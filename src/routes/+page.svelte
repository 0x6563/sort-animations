<script context="module" lang="ts">
    declare const SortMethods: { SortMethods: { [key: string]: string } };
</script>

<script lang="ts">
    import ArrayGraph from '@components/array-graph.svelte';
    import Dropdown from '@components/dropdown.svelte';

    const n = 20;
    let array = Generate();
    const { SortMethods: algorithms } = SortMethods;
    let algorithm = SortMethods.SortMethods.BubbleSort;
    function Generate() {
        return Array.from({ length: n }).map(() => 1 + Math.floor(Math.random() * (n / 2)));
    }
</script>

<div id="app" class="dark">
    <div class="topbar flx row spread">
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
        <button class="btn" on:click={() => (array = Generate())}>Regenerate</button>
    </div>
    <div class="container grow">
        <ArrayGraph {array} {algorithm} />
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
    .topbar {
        position: absolute;
        top: 0;
        z-index: 100;
        height: 50px;
        .setting {
            background: var(--fill);
        }
    }
</style>
