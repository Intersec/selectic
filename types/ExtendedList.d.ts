import { Vue, h } from 'vtyx';
import Store, { OptionItem } from './Store';
/** Where the panel should be mounted: an element, a CSS selector, or
 * 'self' to keep it where the component renders it. */
export type PanelContainer = HTMLElement | string;
export interface Props {
    store: Store;
    width?: number;
    /** Where the panel should be mounted (default: the body of the
     * document the component belongs to) */
    container?: PanelContainer;
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
    private container?;
    private topGroupName;
    private topGroupId;
    private listHeight;
    private listWidth;
    private availableSpace;
    /** The window the panel is displayed in. It is known only once the
     * panel is mounted, and the positions depend on it. */
    private panelWindow;
    /** The element the keydown listener has been added on (the combobox
     * may not be found anymore when the component unmounts) */
    private _comboboxListenerEl?;
    /** check if the height of the box has been completely estimated. */
    get isFullyEstimated(): boolean;
    /** Height the list is expected to take, used while it is not rendered
     * yet (and so cannot be measured). */
    get defaultListHeight(): number;
    /** The window the positions must be computed against (the global one
     * while the panel is not mounted yet) */
    get currentWindow(): Window;
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
     * which is moved into its container) */
    private get comboboxEl();
    /** The panel is moved into its container, so its buttons are not in
     * the natural tab order of the page. From the combobox, Tab enters the
     * panel; from its last element, the focus goes back to the combobox so
     * Tab leaves the component naturally.
     * Returns true when the event is fully handled. */
    private handleTabKey;
    /** The element the panel should be moved into, or null to keep it
     * where the component has rendered it (`'self'`).
     * It is a method and not a getter: it is resolved once, when the panel
     * is mounted (which happens each time the list opens), and it reports
     * an unusable selector. */
    private getContainerEl;
    private attachPanel;
    mounted(): void;
    unmounted(): void;
    render(): h.JSX.Element;
}
