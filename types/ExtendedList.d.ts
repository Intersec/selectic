import { Vue, h } from 'vtyx';
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
    private availableSpace;
    /** check if the height of the box has been completely estimated. */
    get isFullyEstimated(): boolean;
    get searchingLabel(): string;
    get searching(): boolean;
    get errorMessage(): string;
    get infoMessage(): string;
    get onKeyDown(): (evt: KeyboardEvent) => void;
    get bestPosition(): 'top' | 'bottom';
    get position(): 'top' | 'bottom';
    get horizontalStyle(): string;
    get positionStyle(): string;
    onFilteredOptionsChange(): void;
    onHideFilterChange(): void;
    private getGroup;
    private computeListSize;
    mounted(): void;
    unmounted(): void;
    render(): h.JSX.Element;
}
