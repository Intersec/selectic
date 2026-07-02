import { Vue, h } from 'vtyx';
import Store from './Store';
export interface Props {
    store: Store;
}
export default class MultilinesList extends Vue<Props> {
    private store;
    get searchingLabel(): string;
    get searching(): boolean;
    get errorMessage(): string;
    get infoMessage(): string;
    private onKeyDown;
    mounted(): void;
    unmounted(): void;
    render(): h.JSX.Element;
}
