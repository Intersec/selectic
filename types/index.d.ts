import { Vue } from 'vtyx';
import './css/selectic.css';
import { OptionProp, OptionId, StrictOptionId, GroupValue, SelectedValue, FetchCallback, GetCallback, PartialMessages, OptionValue, OptionItem, FormatCallback, SelectionOverflow, ListPosition } from './Store';
import MainInput from './MainInput';
import ExtendedList from './ExtendedList';
export { GroupValue, OptionValue, OptionItem, OptionProp, OptionId, StrictOptionId, SelectedValue, PartialMessages, GetCallback, FetchCallback, FormatCallback, SelectionOverflow, ListPosition, };
export interface ParamProps {
    fetchCallback?: FetchCallback;
    getItemsCallback?: GetCallback;
    pageSize?: number;
    hideFilter?: boolean | 'auto';
    allowRevert?: boolean;
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
    elementBottom: number;
    elementTop: number;
    elementLeft: number;
    elementRight: number;
    width: number;
    private store;
    private _elementsListeners;
    private _oldValue;
    get isFocused(): boolean;
    get scrollListener(): () => void;
    get outsideListener(): (evt: MouseEvent) => void;
    get windowResize(): (_evt: any) => void;
    get inputValue(): string | number;
    get selecticClass(): (string | {
        disabled: boolean;
        'selectic--overflow-multiline': boolean;
        'selectic--overflow-collapsed': boolean;
    })[];
    get hasGivenValue(): boolean;
    get defaultValue(): SelectedValue;
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
    protected onValueChange(): void;
    protected onExcludedChange(): void;
    protected onOptionsChange(): void;
    protected onTextsChange(): void;
    protected onDisabledChange(): void;
    protected onGroupsChanged(): void;
    protected onPlaceholderChanged(): void;
    protected onOpenChanged(): void;
    protected onFocusChanged(): void;
    protected onInternalValueChange(): void;
    private checkFocus;
    private extractFromNode;
    private extractOptionFromNode;
    private extractOptgroupFromNode;
    protected created(): void;
    protected mounted(): void;
    protected beforeUpdate(): void;
    protected beforeDestroy(): void;
    protected render(): JSX.Element;
}
