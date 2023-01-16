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
    get selectionIsExcluded(): boolean;
    get hasNotAllItems(): boolean;
    get disabledPartialData(): boolean;
    get disableSelectAll(): boolean;
    get titleSelectAll(): string;
    get disableRevert(): boolean;
    get enableRevert(): boolean;
    get onKeyPressed(): (evt: KeyboardEvent) => void;
    private keypressed;
    private onInput;
    private onSelectAll;
    private onExclude;
    private togglePanel;
    private getFocus;
    onClosed(): void;
    mounted(): void;
    unmounted(): void;
    render(): h.JSX.Element;
}
