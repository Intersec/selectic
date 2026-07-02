import { Vue, h } from 'vtyx';
import Store from './Store';
export interface Props {
    store: Store;
    onOpen?: () => void;
}
export default class FilterSearch extends Vue<Props> {
    $refs: {
        filterInput: HTMLInputElement;
    };
    private store;
    private onOpen?;
    get searchPlaceholder(): string;
    get onKeyPressed(): (evt: KeyboardEvent) => void;
    private keypressed;
    private onInput;
    focus(): void;
    mounted(): void;
    unmounted(): void;
    render(): h.JSX.Element;
}
