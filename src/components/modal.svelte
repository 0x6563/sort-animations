<script lang="ts">
    import { ModalService, type ModalComponent } from '@services/modal';
    let modal: ModalComponent | null = ModalService.current;

    ModalService.events.on('show', () => {
        modal = ModalService.current;
    });

    ModalService.events.on('close', Hide);
    ModalService.events.on('hide', Hide);

    function Hide() {
        modal = null;
    }
</script>

<div class="modal">
    {#if modal}
        <div class="modal-box">
            <div class="modal-blur" on:click={() => ModalService.blur()} />
            <div class="modal-component">
                <svelte:component this={modal.component} {...modal.properties} />
            </div>
        </div>
    {/if}
</div>

<style lang="scss">
    .modal-blur {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
    }
    .modal-box {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .modal-component {
        z-index: 1;
    }
</style>
