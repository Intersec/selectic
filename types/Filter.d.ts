import { Vue, h } from 'vtyx';
import Store from './Store';
import FilterSearch from './FilterSearch';
export interface Props {
    store: Store;
}
export default class FilterPanel extends Vue<Props> {
    $refs: {
        filterSearch: FilterSearch;
    };
    private store;
    mounted(): void;
    render(): h.JSX.Element;
}
