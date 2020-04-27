import { Vue } from 'vtyx';
import Store from './Store';
export interface Props {
    store: Store;
    offsetTop: number;
    offsetLeft: number;
    width: number;
}
export default class ExtendedList extends Vue<Props> {
    private store;
    private offsetLeft;
    private offsetTop;
    private width;
    private topGroup;
    get searchingLabel(): string;
    get searching(): boolean;
    get errorMessage(): string;
    get infoMessage(): string;
    get onKeyDown(): (evt: KeyboardEvent) => void;
    private getGroup;
    protected mounted(): void;
    protected destroyed(): void;
    protected render(): JSX.Element;
}
