<script lang="ts">
    export let label: string;
    export let value: string;
</script>

<label>
    <span>{label}</span>
    <input type="color" bind:value />
</label>
