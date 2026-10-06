import { Vue, h } from 'vtyx';
import Store from './Store';
export interface Props {
    store: Store;
    /** If true, only handle keys pressed inside the parent component
     * (for always-displayed contexts like the multilines mode) */
    scoped?: boolean;
}
export default class FilterSearch extends Vue<Props> {
    $refs: {
        filterInput: HTMLInputElement;
    };
    private store;
    private scoped;
    /** The element the keypress listener has been added on */
    private _listenerEl?;
    get searchPlaceholder(): string;
    get clearSearchLabel(): string;
    /** The clear action is only offered when there is something to clear */
    get hasSearch(): boolean;
    get listBoxId(): string;
    get activeDescendant(): string | undefined;
    /** The handler is given to `addEventListener`, which types it on the
     * generic `Event` */
    get onKeyPressed(): EventListener;
    private keypressed;
    private clearSearch;
    private onInput;
    focus(): void;
    mounted(): void;
    unmounted(): void;
    render(): h.JSX.Element;
}
