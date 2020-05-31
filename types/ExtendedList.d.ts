import { Vue } from 'vtyx';
import Store from './Store';
export interface Props {
    store: Store;
    offsetTop: number;
    offsetBottom: number;
    offsetLeft: number;
    width: number;
}
export default class ExtendedList extends Vue<Props> {
    private store;
    private offsetLeft;
    private offsetTop;
    private offsetBottom;
    private width;
    private topGroup;
    private listHeight;
    get searchingLabel(): string;
    get searching(): boolean;
    get errorMessage(): string;
    get infoMessage(): string;
    get onKeyDown(): (evt: KeyboardEvent) => void;
    get bestPosition(): 'top' | 'bottom';
    get positionStyle(): string;
    protected onFilteredOptionsChange(): void;
    protected onHideFilterChange(): void;
    private getGroup;
    private computeListHeight;
    protected mounted(): void;
    protected destroyed(): void;
    protected render(): JSX.Element;
}
