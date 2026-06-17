import { h, Vue } from 'vtyx';
import Store from './Store';
export interface Props {
    store: Store;
    icon?: string;
    className?: string;
}
export default class OptionIcon extends Vue<Props> {
    private store;
    private icon;
    private className;
    get normalizedIcon(): string;
    render(): h.JSX.Element | undefined;
}
