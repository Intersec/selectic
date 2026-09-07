import { Vue } from 'vtyx';
import Store from './Store';
export interface Props {
    store: Store;
}
export default class PanelContent extends Vue<Props> {
    private store;
    get searchingLabel(): string;
    get searching(): boolean;
    get errorMessage(): string;
    get infoMessage(): string;
    get hasFooter(): boolean;
    render(): any;
}
