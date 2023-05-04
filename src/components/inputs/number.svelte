<script lang="ts">
    export let label: string;
    export let value: number;
    export let step: number = 1;
    export let min: number = 0;
    export let max: number | undefined = undefined;
</script>

<label>
    <span class="label">{label}</span>
    <input type="number" bind:value {step} {min} {max} />
</label>

<style lang="scss">
    label {
        display: inline-block;
        width: 100px;
        vertical-align: text-top;
        .label {
            text-align: center;
            display: inline-block;
            width: 100px;
        }
        input {
            display: inline-block;
            width: 100px;
            height: 50px;
            box-sizing: border-box;
            text-align: center;
            border: none;
            font-size: 24px;
            background: none;
            color: var(--accent2);
        }
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
            /* display: none; <- Crashes Chrome on hover */
            -webkit-appearance: none;
            margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
        }

        input[type='number'] {
            -moz-appearance: textfield; /* Firefox */
        }
    }
</style>
