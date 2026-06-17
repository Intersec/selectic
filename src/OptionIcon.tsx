/* File Purpose:
 * Display the icon associated with an option (in the dropdown list as well as
 * next to the selected value(s) in the input).
 *
 * It normalizes the icon string before delegating to the generic Icon
 * component: an icon given without an explicit family prefix (no ':') is a
 * plain CSS class and must be rendered as-is, so it is prefixed with "raw:".
 */

import { Component, h, Prop, Vue } from 'vtyx';

import Store from './Store';
import Icon from './Icon';

export interface Props {
    store: Store;

    /* The option icon, as provided by the user (e.g. "fa fa-star" or
     * "selectic:check"). */
    icon?: string;

    /* Class applied on the rendered icon. */
    className?: string;
}

@Component
export default class OptionIcon extends Vue<Props> {

    /* {{{ props */

    @Prop()
    private store: Store;

    @Prop({ default: '' })
    private icon: string;

    @Prop({ default: '' })
    private className: string;

    /* }}} */
    /* {{{ computed */

    get normalizedIcon(): string {
        const icon = this.icon;

        return icon.includes(':') ? icon : `raw:${icon}`;
    }

    /* }}} */

    public render() {
        if (!this.icon) {
            return;
        }

        return (
            <Icon
                icon={this.normalizedIcon}
                store={this.store}
                class={`selectic-icon-space-after ${this.className}`}
            />
        );
    }
}
