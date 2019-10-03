import { Vue } from 'vtyx';
import Store, { OptionItem } from './Store';
export interface Props {
    store: Store;
    id?: string;
}
export default class Selectic extends Vue<Props> {
    private store;
    private id;
    readonly isDisabled: boolean;
    readonly hasValue: boolean;
    readonly displayPlaceholder: boolean;
    readonly canBeCleared: boolean;
    readonly clearedLabel: string;
    readonly singleSelectedItem: string | false;
    readonly singleStyle: string | undefined;
    readonly selecticId: string | undefined;
    readonly isSelectionReversed: boolean;
    readonly reverseSelectionLabel: string;
    readonly formatItem: import("./Store").FormatCallback;
    readonly selectedOptions: OptionItem | OptionItem[] | null;
    private toggleFocus;
    private selectItem;
    private clearSelection;
    protected render(): JSX.Element;
}
