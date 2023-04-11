<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Flyout from './flyout.svelte';
    export let options: ({ key: string; value: any } | string)[] | { [key: string]: any } = [];
    export let value: any = undefined;
    export let expanded = false;
    let map: Map<any, any>;

    const dispatch = createEventDispatcher();
    $: {
        map = new Map();
        if (Array.isArray(options)) {
            for (const option of options) {
                if (typeof option === 'string') {
                    map.set(option, option);
                } else {
                    map.set(option.value, option.key);
                }
            }
        } else {
            for (const key in options) {
                map.set(options[key], key);
            }
        }
    }
    function Toggle() {
        expanded = !expanded;
    }
    function SelectFactory(option) {
        return () => {
            value = option;
            dispatch('select', value);
            Toggle();
        };
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="container">
    <div class="label" on:click={Toggle}>
        {#if $$slots.label}
            <slot name="label" label={map.get(value)} {value} />
        {:else}
            {map.get(value)}
        {/if}
    </div>
    <Flyout {expanded}>
        {#each [...map] as [v, key]}
            <div class="option" class:selected={v == value} on:click={SelectFactory(v)}>
                {#if $$slots.option}
                    <slot name="option" label={key} value={v} selected={v == value} />
                {:else}
                    {key}
                {/if}
            </div>
        {/each}
    </Flyout>
</div>

<style lang="scss">
    .label,
    .option {
        cursor: pointer;
    }
</style>
