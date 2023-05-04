<script context="module" lang="ts">
    import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
    import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
    import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
    import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
    import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

</script>

<script lang="ts">
    type Monaco = typeof import('monaco-editor');
    import type { editor, languages } from 'monaco-editor';
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
    import { Theme } from '@services/theme';

    export let value = '';
    export let language = 'json';
    export let minHeight = 200;
    export let maxHeight = 0;
    export let minWidth = 600;
    export let maxWidth = 0;
    export let theme = 'vs-dark';
    export let width: 'fill' | 'auto' = 'fill';
    export let height: 'fill' | 'auto' = 'fill';
    export let settings: editor.IStandaloneEditorConstructionOptions = {};
    export let typings: { [key: string]: string } = {};

    let container: HTMLDivElement;
    const dispatch = createEventDispatcher();
    let codeEditor: editor.IStandaloneCodeEditor;
    let Monaco: Monaco;
    $: {
        if (codeEditor && value != codeEditor.getValue()) {
            codeEditor.setValue(value);
            resize();
        }

        if (codeEditor) {
            Monaco.editor.setTheme(theme);
        }
    }
    Theme.subscribe((v) => (theme = v == 'light' ? 'vs-light' : 'vs-dark'));

    onMount(async () => {
        Monaco = await import('monaco-editor');

        const CustomLanguages: {
            [key: string]: {
                tokensProvider?: languages.IMonarchLanguage;
                completionItemProvider?: languages.CompletionItemProvider;
            };
        } = {};

        const CustomThemes: { [key: string]: editor.IStandaloneThemeData } = {};

        for (const id in CustomLanguages) {
            const { tokensProvider, completionItemProvider } = CustomLanguages[id];
            Monaco.languages.register({ id });
            if (tokensProvider) {
                Monaco.languages.setMonarchTokensProvider(id, tokensProvider);
            }
            if (completionItemProvider) {
                Monaco.languages.registerCompletionItemProvider(id, completionItemProvider);
            }
        }

        for (const id in CustomThemes) {
            Monaco.editor.defineTheme(id, CustomThemes[id]);
        }
        for (const key in typings) {
            Monaco.languages.typescript.javascriptDefaults.addExtraLib(typings[key], key);
        }

        window.MonacoEnvironment = {
            getWorker(_, label) {
                if (label === 'json') {
                    return new jsonWorker();
                }
                if (label === 'css' || label === 'scss' || label === 'less') {
                    return new cssWorker();
                }
                if (label === 'html' || label === 'handlebars' || label === 'razor') {
                    return new htmlWorker();
                }
                if (label === 'typescript' || label === 'javascript') {
                    return new tsWorker();
                }
                return new editorWorker();
            },
        };

        codeEditor = Monaco.editor.create(container, {
            value,
            language,
            theme,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            ...settings,
        });

        resize();

        codeEditor.getModel()?.onDidChangeContent(() => {
            value = codeEditor.getValue();
            resize();
            dispatch('edit', value);
        });

        dispatch('load', {
            resize,
        });
    });

    onDestroy(() => {
        if (codeEditor) {
            codeEditor.dispose();
            const model = codeEditor.getModel();
            if (model) model.dispose();
        }
    });

    function resize() {
        container.style.display = 'block';
        container.style.width = '100%';
        container.style.height = '100%';

        let targetWidth = container.offsetWidth;
        let targetHeight = container.offsetHeight;

        if (width == 'auto') {
            targetWidth = codeEditor.getContentWidth();
        }

        if (height == 'auto') {
            targetHeight = codeEditor.getContentHeight();
        }

        const newWidth = Math.max(minWidth, Math.min(maxWidth || targetWidth, targetWidth));
        const newHeight = Math.max(minHeight, Math.min(maxHeight || targetHeight, targetHeight));

        codeEditor.layout({ width: newWidth, height: newHeight });
        container.style.height = `${newHeight}px`;
        container.style.width = `${newWidth}px`;
    }
</script>

<div bind:this={container} class="editor" />

<style>
    .editor {
        height: 100%;
        width: 100%;
        position: relative;
    }
</style>
