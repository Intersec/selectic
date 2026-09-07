import { Vue, h } from 'vtyx';
import Store from './Store';
import FilterSearch from './FilterSearch';
import List from './List';
export interface Props {
    store: Store;
}
export default class MultilinesList extends Vue<Props> {
    $refs: {
        filterSearch?: FilterSearch;
        list?: List;
    };
    private store;
    private onKeyDown;
    /** Move the DOM focus to the search input (or to the list) */
    focus(): void;
    mounted(): void;
    unmounted(): void;
    render(): h.JSX.Element;
}
