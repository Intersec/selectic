import { Vue, h } from 'vtyx';
import Store, { OptionItem } from './Store';
export interface Props {
    store: Store;
    width?: number;
    elementTop?: number;
    elementBottom?: number;
    elementLeft?: number;
    elementRight?: number;
}
export default class ExtendedList extends Vue<Props> {
    private store;
    private elementLeft;
    private elementRight;
    private elementTop;
    private elementBottom;
    private width;
    private topGroupName;
    private topGroupId;
    private listHeight;
    private listWidth;
    private availableSpace;
    /** check if the height of the box has been completely estimated. */
    get isFullyEstimated(): boolean;
    get bestPosition(): 'top' | 'bottom';
    get position(): 'top' | 'bottom';
    get horizontalStyle(): string;
    get positionStyle(): string;
    get topGroup(): OptionItem | undefined;
    get topGroupSelected(): boolean;
    get topGroupDisabled(): boolean;
    onFilteredOptionsChange(): void;
    onHideFilterChange(): void;
    private getGroup;
    private computeListSize;
    private clickHeaderGroup;
    private onKeyDown;
    /** The combobox this panel is attached to (it lives outside the panel,
     * which is appended to the body) */
    private get comboboxEl();
    /** The panel is appended at the end of body, so its buttons are not in
     * the natural tab order of the page. From the combobox, Tab enters the
     * panel; from its last element, the focus goes back to the combobox so
     * Tab leaves the component naturally.
     * Returns true when the event is fully handled. */
    private handleTabKey;
    mounted(): void;
    unmounted(): void;
    render(): h.JSX.Element;
}
