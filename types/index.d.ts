import { Vue, h } from 'vtyx';
import './css/selectic.css';
import { OptionProp, OptionId, StrictOptionId, GroupValue, SelectedValue, FetchCallback, GetCallback, PartialMessages, OptionValue, OptionItem, FormatCallback, SelectionOverflow, ListPosition, HideFilter, SelectAllOption } from './Store';
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
    fetchCallback?: FetchCallback;
    getItemsCallback?: GetCallback;
    pageSize?: number;
    hideFilter?: HideFilter;
    allowRevert?: boolean;
    forceSelectAll?: SelectAllOption;
    allowClearSelection?: boolean;
    autoSelect?: boolean;
    autoDisabled?: boolean;
    strictValue?: boolean;
    selectionOverflow?: SelectionOverflow;
    emptyValue?: SelectedValue;
    formatOption?: FormatCallback;
    formatSelection?: FormatCallback;
    listPosition?: ListPosition;
    optionBehavior?: string;
    keepOpenWithOtherSelectic?: boolean;
}
export declare type OnCallback = (event: string, ...args: any[]) => void;
export declare type GetMethodsCallback = (methods: {
    clearCache: Selectic['clearCache'];
    changeTexts: Selectic['changeTexts'];
    getValue: Selectic['getValue'];
    getSelectedItems: Selectic['getSelectedItems'];
    isEmpty: Selectic['isEmpty'];
    toggleOpen: Selectic['toggleOpen'];
}) => void;
export interface Props {
    value?: SelectedValue;
    selectionIsExcluded?: boolean;
    options?: OptionProp[];
    groups?: GroupValue[];
    multiple?: boolean;
    disabled?: boolean;
    placeholder?: string;
    id?: string;
    className?: string;
    title?: string;
    texts?: PartialMessages;
    noCache?: Boolean;
    open?: Boolean;
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
    clearCache(forceReset?: boolean): void;
    changeTexts(texts: PartialMessages): void;
    getValue(): SelectedValue;
    getSelectedItems(): OptionValue | OptionValue[];
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
