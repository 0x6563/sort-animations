<script lang="ts">
    export let label: string;
    export let value: number;
    export let step: number = 1;
    export let min: number = 0;
    export let max: number | undefined = undefined;
</script>

<label>
    <span>{label}</span>
    <input type="number" bind:value {step} {min} {max} />
</label>
