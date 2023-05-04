<script lang="ts">
    export let label: string;
    export let value: string;
</script>

<label>
    <span class="label">{label}</span>
    <span class="color" style="background:{value};"> <span class="hex">{value || 'transparent'}</span></span>
    <input type="color" bind:value />
</label>

<style lang="scss">
    label {
        display: inline-block;
        width: 100px;
        .label {
            text-align: center;
            display: inline-block;
            width: 100px;
        }
        .color {
            display: inline-flex;
            width: 100px;
            height: 50px;
            align-items: center;
            justify-content: center;
        }
        input {
            opacity: 0;
            height: 0;
            width: 0;
        }
    }
</style>
