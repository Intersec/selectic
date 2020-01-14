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
    readonly searchingLabel: string;
    readonly searching: boolean;
    readonly errorMessage: string;
    readonly infoMessage: string;
    readonly onKeyDown: (evt: KeyboardEvent) => void;
    private getGroup;
    protected mounted(): void;
    protected destroyed(): void;
    protected render(): JSX.Element;
}
