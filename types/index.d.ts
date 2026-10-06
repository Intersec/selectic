import { Vue, h } from 'vtyx';
import './css/selectic.css';
import { OptionProp, OptionId, StrictOptionId, GroupValue, SelectedValue, FetchCallback, GetCallback, PartialMessages, OptionValue, OptionItem, FormatCallback, SelectionOverflow, ListPosition, HideFilter, SelectAllOption, PartialIcons, IconFamily, FooterConfig, FooterButtonConfig } from './Store';
import MainInput from './MainInput';
import ExtendedList, { PanelContainer } from './ExtendedList';
import MultilinesList from './MultilinesList';
export { GroupValue, OptionValue, OptionItem, OptionProp, OptionId, StrictOptionId, SelectedValue, PartialMessages, GetCallback, FetchCallback, FormatCallback, SelectionOverflow, ListPosition, HideFilter, FooterConfig, FooterButtonConfig, PanelContainer, };
type EventType = 'input' | 'change' | 'open' | 'close' | 'focus' | 'blur' | 'item:click';
export interface EventOptions {
    instance: Selectic;
    eventType: EventType;
    automatic: boolean;
}
export interface EventChangeOptions extends EventOptions {
    isExcluded: boolean;
}
export interface ParamProps {
    /** Method to call to fetch extra data */
    fetchCallback?: FetchCallback;
    /** Method to call to get specific items */
    getItemsCallback?: GetCallback;
    /** Number of elements to fetch.
     * When scrolled too fast, a greater number of elements
     * are going to be requested.
     */
    pageSize?: number;
    /** Number of items displayed at once in the opened list (default: 10) */
    displayedItems?: number;
    /** Height (in px) of an item row in the opened list (default: 27).
     * It drives the virtual scroll offsets, so it should match the height
     * the items are really rendered with. */
    itemHeight?: number;
    /** Hide the search control */
    hideFilter?: HideFilter;
    /** Allow to reverse selection.
     * If true, parent should support the selectionIsExcluded property.
     * If false, the action is never available.
     * If undefined, the action is available only when it is not needed to
     * change selectionIsExcluded property.
     */
    allowRevert?: boolean;
    /** If true, the "select All" is still available even if all data are not fetched yet. */
    forceSelectAll?: SelectAllOption;
    /** Allow user to clear the current selection */
    allowClearSelection?: boolean;
    /** If false, avoid selecting the first available option. */
    autoSelect?: boolean;
    /** Disable the select if no or only one option is given and must be selected. */
    autoDisabled?: boolean;
    /** If true, value can be only in existing options. */
    strictValue?: boolean;
    /** Define how to behave when selected items are too large for container.
     *     collapsed (default): Items are reduced in width and an ellipsis
     *                          is displayed in their name.
     *     multiline: The container extends in height in order to display all
     *                items.
     */
    selectionOverflow?: SelectionOverflow;
    /** In single mode, if no selection, this value is returned (default=null). */
    emptyValue?: SelectedValue;
    /** Called when item is displayed in the list. */
    formatOption?: FormatCallback;
    /** Called when item is displayed in the selection area. */
    formatSelection?: FormatCallback;
    /** Define where the list should be displayed.
     * With 'auto' it is displayed by default at bottom, but it can be at
     * top if there is not enough space below. */
    listPosition?: ListPosition;
    /** Described behavior when options from several sources are set (static, dynamic, slots)
     * It describe what to do (sort or force)
     * and the order (O → static options, D → dynamic options, E → slot elements)
     * Example: "sort-ODE"
     */
    optionBehavior?: string;
    /** Keep this component open if another Selectic component opens.
     *
     * - `true`  → Keep open for **any** Selectic component.
     * - `string` → Keep open only when the other Selectic matches the given CSS selector.
     * - `false` (default) → Always close when another Selectic opens.
     *
     * An empty string is treated the same as `false`.
     */
    keepOpenWithOtherSelectic?: boolean | string;
    /** Avoid click on group name to select all items in this group. */
    disableGroupSelection?: boolean;
    /** Footer configuration.
     *
     * When present (even as an empty object), a footer bar is rendered
     * under the list. Each entry configures the matching button. See
     * `FooterConfig` for the available buttons.
     *
     * Every button acts on its own: the result is observed through the
     * `input` and `change` events. Buttons with a custom behavior belong
     * to the `listFooter` slot. */
    footer?: FooterConfig;
}
export type OnCallback = (event: string, ...args: any[]) => void;
export type GetMethodsCallback = (methods: {
    clearCache: Selectic['clearCache'];
    changeTexts: Selectic['changeTexts'];
    changeIcons: Selectic['changeIcons'];
    getValue: Selectic['getValue'];
    getSelectedItems: Selectic['getSelectedItems'];
    isEmpty: Selectic['isEmpty'];
    toggleOpen: Selectic['toggleOpen'];
}) => void;
export interface Props {
    /** Selectic's initial value */
    value?: SelectedValue;
    /** If true, the effective selection is the opposite */
    selectionIsExcluded?: boolean;
    /** List of options to display */
    options?: OptionProp[];
    /** Define groups of items (similar to optGroup) */
    groups?: GroupValue[];
    /** Equivalent of <select>'s "multiple" attribute */
    multiple?: boolean;
    /** Equivalent of <select>'s "disabled" attribute */
    disabled?: boolean;
    /** Equivalent of <input>'s "placeholder" attribute */
    placeholder?: string;
    /** id of the HTML element */
    id?: string;
    /** CSS class of the HTML element */
    className?: string;
    /** CSS class of the list panel.
     * When not empty, it replaces `className` on the panel, which stays on
     * the main element. */
    listClassName?: string;
    /** Where the list panel should be mounted: an element, a CSS
     * selector, or 'self' to keep it inside the component.
     * It defaults to the body of the document the component belongs to. */
    container?: PanelContainer;
    /** title on the HTML element */
    title?: string;
    /** Replace the default texts used in Selectic */
    texts?: PartialMessages;
    /** Replace the default icons used in Selectic */
    icons?: PartialIcons;
    /** Replace the default icon family used in Selectic */
    iconFamily?: IconFamily;
    /** If enabled, it resets the dynamic cache when selectic opens */
    noCache?: boolean;
    /** If true, the component opens (at start or if it is closed).
     *  If false, the components closes (if it is opened). */
    open?: boolean;
    /** If true, renders the list content inline (search bar + items)
     *  instead of the standard input-with-dropdown layout.
     *  A number switches the mode on too, and sets how many items the
     *  inline list displays at once (like `params.displayedItems`, which
     *  keeps the priority when both are given). */
    multilines?: boolean | number;
    /** Props which is not expected to change during the life time of the
     * component.
     * These parameters modify the component behavior but are not official
     * attributes of select.
     */
    params?: ParamProps;
    /** _on is used mainly for tests.
     * Its purpose is to propagate $emit event mainly
     * for parents which are not in Vue environment.
     */
    _on?: OnCallback;
    /** _getMethods is used mainly for tests.
     * Its purpose is to provide public methods outside of a Vue environment.
     */
    _getMethods?: GetMethodsCallback;
}
export declare function changeTexts(texts: PartialMessages): void;
export declare function changeIcons(icons: PartialIcons, iconFamily?: IconFamily): void;
export default class Selectic extends Vue<Props> {
    $refs: {
        mainInput: MainInput;
        extendedList?: ExtendedList;
        multilinesList?: MultilinesList;
    };
    value?: SelectedValue;
    selectionIsExcluded: boolean;
    options: OptionProp[];
    groups: GroupValue[];
    multiple: boolean;
    disabled: boolean;
    placeholder: string;
    id: string;
    className: string;
    listClassName?: string;
    container?: PanelContainer;
    title?: string;
    texts?: PartialMessages;
    icons?: PartialIcons;
    iconFamily?: IconFamily;
    noCache: boolean;
    open?: boolean;
    multilines: boolean | number;
    params: ParamProps;
    /** For tests */
    _on?: OnCallback;
    _getMethods?: GetMethodsCallback;
    elementBottom: number;
    elementTop: number;
    elementLeft: number;
    elementRight: number;
    width: number;
    private hasBeenRendered;
    /** Multilines mode only: true while the DOM focus is inside the
     * component (there is no dropdown lifecycle to rely on) */
    private multilinesFocused;
    private store;
    private _elementsListeners;
    private _multilinesListeners?;
    /** Multilines mode: whether the last pointer interaction started
     * inside the component (see `checkMultilinesFocus`) */
    private _pointerIsInside?;
    private _oldValue;
    /** The inline layout is on for `true` as well as for a number of items
     * (`0` and `false` both keep the dropdown layout) */
    get isMultilines(): boolean;
    /** Number of items the inline list displays at once, when the mode is
     * given as a number */
    get multilinesItems(): number | undefined;
    get isFocused(): boolean;
    get scrollListener(): () => void;
    get outsideListener(): (evt: MouseEvent) => void;
    get windowResize(): (_evt: any) => void;
    get inputValue(): StrictOptionId;
    get selecticClass(): (string | {
        disabled: boolean;
        'selectic--overflow-multiline': boolean;
        'selectic--overflow-collapsed': boolean;
    })[];
    /** Class applied on the list panel: `listClassName` when it is not
     * empty, `className` otherwise. */
    get listClass(): string;
    get hasGivenValue(): boolean;
    get defaultValue(): string | number | StrictOptionId[] | null;
    /** Reset the inner cache (mainly for dynamic mode if context has changed) */
    clearCache(forceReset?: boolean): void;
    /** Allow to change all text of the component */
    changeTexts(texts: PartialMessages): void;
    /** Allow to change all icons of the component */
    changeIcons(icons: PartialIcons, iconFamily?: IconFamily): void;
    /** Return the current selection */
    getValue(): SelectedValue;
    /** Return the current selection in Item format */
    getSelectedItems(): OptionValue | OptionValue[];
    /** Check if there are Options available in the components */
    isEmpty(): boolean;
    toggleOpen(open?: boolean): boolean;
    private computeWidth;
    /** The document the component is displayed in (which is not the
     * global one when it lives in a detached window).
     * It is a method and not a getter: a getter is a computed, and it
     * would cache the global document if it were read before the
     * component is mounted. */
    private getDocument;
    private computeOffset;
    private removeListeners;
    private focusToggled;
    private compareValues;
    onValueChange(): void;
    onExcludedChange(): void;
    onOptionsChange(): void;
    onTextsChange(): void;
    onIconsChange(): void;
    onDisabledChange(): void;
    onGroupsChanged(): void;
    onPlaceholderChanged(): void;
    onOpenChanged(): void;
    onFocusChanged(): void;
    onInternalValueChange(): void;
    /** Multilines mode: follow the focus inside the component, the way
     * `checkFocus` does for the dropdown mode.
     *
     * The DOM focus alone is not enough here: clicking an option only
     * focuses the closest focusable ancestor, and Firefox and Safari do not
     * focus a `<button>` on click. The pointer is therefore watched too, so
     * that interacting with the list is not reported as a blur. */
    private addMultilinesFocusListeners;
    private checkMultilinesFocus;
    private removeMultilinesFocusListeners;
    private onInputValueFocus;
    private giveFocusBack;
    private checkFocus;
    private _emit;
    private emit;
    private renderMultilines;
    private renderDefault;
    created(): void;
    mounted(): void;
    beforeUpdate(): void;
    beforeUnmount(): void;
    render(): h.JSX.Element | undefined;
}
