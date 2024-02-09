import { Vue, h } from 'vtyx';
import './css/selectic.css';
import { OptionProp, OptionId, StrictOptionId, GroupValue, SelectedValue, FetchCallback, GetCallback, PartialMessages, OptionValue, OptionItem, FormatCallback, SelectionOverflow, ListPosition, HideFilter, SelectAllOption, PartialIcons, IconFamily } from './Store';
import MainInput from './MainInput';
import ExtendedList from './ExtendedList';
export { GroupValue, OptionValue, OptionItem, OptionProp, OptionId, StrictOptionId, SelectedValue, PartialMessages, GetCallback, FetchCallback, FormatCallback, SelectionOverflow, ListPosition, HideFilter, };
declare type EventType = 'input' | 'change' | 'open' | 'close' | 'focus' | 'blur' | 'item:click';
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
    /** Keep this component open if another Selectic component opens */
    keepOpenWithOtherSelectic?: boolean;
    /** Avoid click on group name to select all items in this group. */
    disableGroupSelection?: boolean;
}
export declare type OnCallback = (event: string, ...args: any[]) => void;
export declare type GetMethodsCallback = (methods: {
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
    /** title on the HTML element */
    title?: string;
    /** Replace the default texts used in Selectic */
    texts?: PartialMessages;
    /** Replace the default icons used in Selectic */
    icons?: PartialIcons;
    /** Replace the default icon family used in Selectic */
    iconFamily?: IconFamily;
    /** If enabled, it resets the dynamic cache when selectic opens */
    noCache?: Boolean;
    /** If true, the component opens (at start or if it is closed).
     *  If false, the components closes (if it is opened). */
    open?: Boolean;
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
        extendedList: ExtendedList;
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
    title?: string;
    texts?: PartialMessages;
    icons?: PartialIcons;
    iconFamily?: IconFamily;
    noCache: boolean;
    open?: boolean;
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
    private store;
    private _elementsListeners;
    private _oldValue;
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
    private checkFocus;
    private _emit;
    private emit;
    created(): void;
    mounted(): void;
    beforeUpdate(): void;
    beforeUnmount(): void;
    render(): h.JSX.Element | undefined;
}
