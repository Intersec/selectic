/* File Purpose:
 * Display the wanted icon.
 */

import { Component, h, Prop, Vue, Watch } from 'vtyx';

import Store, { IconFamily, IconKey, IconValue } from './Store';
import IconCaretDown from './icons/caret-down';
import IconCaretUp from './icons/caret-up';
import IconCheck from './icons/check';
import IconDot from './icons/dot';
import IconQuestion from './icons/question';
import IconSearch from './icons/search';
import IconSpinner from './icons/spinner';
import IconStrikeThrough from './icons/strikeThrough';
import IconTimes from './icons/times';

export interface Props {
    store: Store;
    icon: string;
    spin?: boolean;
    title?: string;
}

@Component
export default class Icon extends Vue<Props> {

    /* {{{ props */

    @Prop()
    private store: Store;

    @Prop()
    private icon: string;

    @Prop()
    private spin?: boolean;

    @Prop()
    private title?: string;

    /* }}} */
    /* {{{ computed */

    private get rawIconValue(): IconValue {
        const key = this.icon as IconKey;
        const icon = this.store.data.icons[key];

        if (icon === undefined) {
            return key;
        }

        return icon;
    }

    private get family(): IconFamily {
        const iconValue = this.rawIconValue;

        if (iconValue.startsWith('selectic:')) {
            return 'selectic';
        }
        if (iconValue.startsWith('raw:')) {
            return 'raw';
        }

        return this.store.data.iconFamily;
    }

    private get iconValue(): string {
        const key = this.rawIconValue;

        if (key.includes(':')) {
            /* This is to retrieve value from string such as
             * 'selectic:spinner:spin' (and get only 'spinner') */
            const value = key.split(':');

            return value[1];
        }

        return key;
    }

    private get vueIcon() {
        switch(this.icon) {
            case 'caret-down':
                return IconCaretDown;
            case 'caret-up':
                return IconCaretUp;
            case 'check':
                return IconCheck;
            case 'dot':
                return IconDot;
            case 'search':
                return IconSearch;
            case 'spinner':
                return IconSpinner;
            case 'strikethrough':
                return IconStrikeThrough;
            case 'times':
                return IconTimes;
            case 'question':
            default:
                return IconQuestion;
        }
    }

    private get spinClass(): string {
        let value = this.store.data.icons.spin;

        if (typeof value === 'string') {
            if (value.startsWith('selectic:')) {
                return 'selectic-spin';
            }
            if (value.includes(':')) {
                value = value.split(':')[1] ?? 'spin';
            }
        } else {
            value = 'spin';
        }
        const family = this.family;

        let prefix = '';

        switch (family) {
            case 'font-awesome-4':
                prefix = 'fa-';
                break;
            case 'font-awesome-5':
                prefix = 'fa-';
                break;
            case 'font-awesome-6':
                prefix = 'fa-';
                break;
            case '':
            case 'selectic':
                prefix = 'selectic-';
                break;
            case 'raw':
                prefix = '';
                break;
            default:
                prefix = 'selectic-';
        }

        return `${prefix}${value}`;
    }

    private get spinActive(): boolean {
        return this.spin || this.rawIconValue.endsWith(':spin');
    }

    /* }}} */

    private renderInnerIcon() {
        const component = this.vueIcon;

        return h(
            component,
            {
                class: {
                    'selectic__icon': true,
                    [this.spinClass]: this.spinActive,
                },
                title: this.title,
            }
        );
    }

    private renderSpanIcon(prefix: string) {
        const classSpin = this.spinActive && this.spinClass || '';

        return (
            <span
                class={`${prefix}${this.iconValue} ${classSpin}`}
                title={this.title}
            />
        );
    }

    public render() {
        const family = this.family;

        switch (family) {
            case '':
            case 'selectic':
                return this.renderInnerIcon();
            case 'font-awesome-4':
                return this.renderSpanIcon('fa fa-fw fa-');
            case 'font-awesome-5':
                return this.renderSpanIcon('fas fa-fw fa-');
            case 'font-awesome-4':
                return this.renderSpanIcon('fa-solid fa-fw fa-');
            case 'raw':
                return this.renderSpanIcon('');
            default:
                if (family.startsWith('prefix:')) {
                    return this.renderSpanIcon(family.slice(7));
                }
                return this.renderInnerIcon();
        }
    }
}
