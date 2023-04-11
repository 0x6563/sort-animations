<script lang="ts">
    import { onDestroy } from 'svelte';
    export let expanded = false;
    export let polling = 0;

    let interval;
    let container: HTMLElement;
    let height = '0px';
    let v;
    $: v = { expanded } && RefreshHeight();

    $: SetPoll(polling);

    onDestroy(() => SetPoll(0));

    function SetPoll(n?: number) {
        clearInterval(interval);
        if (n) {
            interval = setInterval(RefreshHeight, n);
        }
    }

    function RefreshHeight() {
        if (container) {
            height = (expanded ? container.scrollHeight : 0) + 'px';
        }
        return height;
    }
</script>

<div class="flyout" class:expanded style:height>
    <div class="inner" bind:this={container}>
        <slot />
    </div>
</div>

<style lang="scss">
    .flyout {
        opacity: 0;
        height: 0;
        overflow: hidden;
        transition: all 200ms;
        &.expanded {
            opacity: 1;
        }
        .inner {
            overflow: hidden;
        }
    }
</style>
