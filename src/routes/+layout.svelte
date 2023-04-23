<script lang="ts">
    import { Theme } from '@services/theme';
    import { onMount } from 'svelte';
    import '../app.scss';
    let app: HTMLElement;
    let theme: 'light' | 'dark' = 'dark';
    onMount(() => {
        // toggleTheme();
    });
    function toggleTheme() {
        theme = theme == 'light' ? 'dark' : 'light';
        app.className = theme;
        Theme.set(theme);
    }
</script>

<div id="app" bind:this={app} class="dark">
    <div class="body flx grow column">
        <slot />
    </div>

    <div id="swatch">
        <span class="background" />
        <span class="diffuse" />
        <span class="basic" />
        <span class="primary" />
        <span class="secondary" />
        <span class="warning" />
        <span class="positive" />
        <span class="negative" />
    </div>
</div>

<style lang="scss">
    #app {
        height: 100%;
        width: 100%;
        display: flex;
        overflow: hidden;
        .body {
            height: 100%;
            width: 100%;
            overflow: hidden;
        }
    }
</style>
