import { Vue } from 'vtyx';
import Store from './Store';
export interface Props {
    store: Store;
    width: number;
    elementTop: number;
    elementBottom: number;
    elementLeft: number;
    elementRight: number;
}
export default class ExtendedList extends Vue<Props> {
    private store;
    private elementLeft;
    private elementRight;
    private elementTop;
    private elementBottom;
    private width;
    private topGroup;
    private listHeight;
    private listWidth;
    get searchingLabel(): string;
    get searching(): boolean;
    get errorMessage(): string;
    get infoMessage(): string;
    get onKeyDown(): (evt: KeyboardEvent) => void;
    get bestPosition(): 'top' | 'bottom';
    get horizontalStyle(): string;
    get positionStyle(): string;
    protected onFilteredOptionsChange(): void;
    protected onHideFilterChange(): void;
    private getGroup;
    private computeListSize;
    protected mounted(): void;
    protected destroyed(): void;
    protected render(): JSX.Element;
}
