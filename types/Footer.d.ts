import { Vue, h } from 'vtyx';
import Store from './Store';
export interface Props {
    store: Store;
}
export default class Footer extends Vue<Props> {
    private store;
    get hasNotAllItems(): boolean;
    get enableRevert(): boolean;
    get disabledPartialData(): boolean;
    get disableSelectAll(): boolean;
    get titleSelectAll(): string;
    get disableRevert(): boolean;
    private getConfig;
    private getLabel;
    private onSelectAll;
    private onInvertSelection;
    render(): h.JSX.Element;
}
