<script lang="ts">
    export let icon: string;
    export let align: string = 'middle';
</script>

<span class="material-symbols-outlined" style:vertical-align={align}>
    {icon}
</span>

<style>
    .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 40;
        font-size: 1.25em;
        color: inherit;
    }
</style>
