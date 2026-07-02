import { Vue, h } from 'vtyx';
import Store from './Store';
export interface Props {
    store: Store;
}
export default class FilterPanel extends Vue<Props> {
    $refs: {
        filterInput: HTMLInputElement;
    };
    private store;
    private closed;
    get searchPlaceholder(): string;
    get onKeyPressed(): (evt: KeyboardEvent) => void;
    private keypressed;
    private onInput;
    private togglePanel;
    private getFocus;
    onClosed(): void;
    mounted(): void;
    unmounted(): void;
    render(): h.JSX.Element;
}
