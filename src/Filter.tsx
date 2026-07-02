/* File Purpose:
 * It manages all controls which can filter the data.
 */

import {Vue, Component, Prop, h} from 'vtyx';

import Store from './Store';
import FilterSearch from './FilterSearch';

export interface Props {
    store: Store;
}

@Component
export default class FilterPanel extends Vue<Props> {
    public $refs: {
        filterSearch: FilterSearch;
    };

    /* {{{ props */

    @Prop()
    private store: Store;

    /* }}} */
    /* {{{ Life cycle */

    public mounted() {
        this.$refs.filterSearch?.focus();
    }

    /* }}} */

    public render() {
        return (
            <div class="filter-panel">
                <FilterSearch
                    store={this.store}
                    ref="filterSearch"
                />
            </div>
        );
    }
}
