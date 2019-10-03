import { Vue } from 'vtyx';
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
    readonly searchPlaceholder: string;
    readonly selectionIsExcluded: boolean;
    readonly disableSelectAll: boolean;
    readonly disableRevert: boolean;
    readonly enableRevert: boolean;
    readonly onKeyPressed: (evt: KeyboardEvent) => void;
    private keypressed;
    private onInput;
    private onSelectAll;
    private onExclude;
    private togglePanel;
    private getFocus;
    protected onClosed(): void;
    protected mounted(): void;
    protected destroyed(): void;
    protected render(): JSX.Element;
}
