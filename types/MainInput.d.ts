import { Vue } from 'vtyx';
import Store, { OptionItem } from './Store';
export interface Props {
    store: Store;
    id?: string;
}
export default class Selectic extends Vue<Props> {
    $refs: {
        selectedItems: HTMLDivElement;
    };
    private store;
    private id;
    private nbHiddenItems;
    readonly isDisabled: boolean;
    readonly hasValue: boolean;
    readonly displayPlaceholder: boolean;
    readonly canBeCleared: boolean;
    readonly showClearAll: boolean;
    readonly clearedLabel: string;
    readonly singleSelectedItem: string | false;
    readonly singleStyle: string | undefined;
    readonly selecticId: string | undefined;
    readonly isSelectionReversed: boolean;
    readonly reverseSelectionLabel: string;
    readonly formatItem: import("./Store").FormatCallback;
    readonly selectedOptions: OptionItem | OptionItem[] | null;
    readonly showSelectedOptions: OptionItem[];
    readonly moreSelectedNb: string;
    readonly moreSelectedTitle: string;
    private toggleFocus;
    private selectItem;
    private clearSelection;
    private computeSize;
    protected onInternalChange(): void;
    protected updated(): void;
    protected render(): JSX.Element;
}
