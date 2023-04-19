<script lang="ts">
    import type { AnimationFrame } from '@services/types';

    export let animations: AnimationFrame[] = [];
</script>

{#each animations as animation}
    {#if animation.set}
        {#each Object.entries(animation.set) as [attribute, value]}
            {#if animation.duration}
                <animate href={animation.id ? `#${animation.id}` : undefined} attributeName={attribute} to={value} begin={animation.begin + 'ms'} dur={animation.duration + 'ms'} fill="freeze" />
            {:else}
                <set href={animation.id ? `#${animation.id}` : undefined} attributeName={attribute} to={value} begin={animation.begin + 'ms'} />
            {/if}
        {/each}
    {/if}
    {#if animation.offset}
        {#each Object.entries(animation.offset) as [attribute, value]}
            {#if animation.duration}
                <animate href={animation.id ? `#${animation.id}` : undefined} attributeName={attribute} by={value} begin={animation.begin + 'ms'} dur={animation.duration + 'ms'} fill="freeze" />
            {:else}
                <set href={animation.id ? `#${animation.id}` : undefined} attributeName={attribute} by={value} begin={animation.begin + 'ms'} />
            {/if}
        {/each}
    {/if}
{/each}
