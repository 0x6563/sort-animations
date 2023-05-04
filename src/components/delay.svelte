<script lang="ts">
    import { onMount } from 'svelte';

    export let wait = 0;
    let show = false;
    onMount(() => {
        setTimeout(() => (show = true), wait);
    });
</script>

{#if show}
    <slot />
{/if}
