/* File Purpose:
 * Display the icon associated with an option (in the dropdown list as well as
 * next to the selected value(s) in the input).
 *
 * It normalizes the icon string before delegating to the generic Icon
 * component: an icon given without an explicit family prefix (no ':') is a
 * plain CSS class and must be rendered as-is, so it is prefixed with "raw:".
 *
 * An icon prefixed with "img:" is an image URL instead of a class. It is
 * rendered here, without reaching Icon: the icon families describe class
 * names, they have nothing to resolve on an URL.
 */

import { Component, h, Prop, Vue, Watch } from 'vtyx';

import Store from './Store';
import Icon from './Icon';

/** Marks the icon of an option as an image URL instead of a class name. */
const IMAGE_PREFIX = 'img:';

export interface Props {
    store: Store;

    /* The option icon, as provided by the user (e.g. "fa fa-star",
     * "selectic:check" or "img:https://example.org/avatar.png"). */
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
    /* {{{ data */

    /** Set when the browser cannot load the image, to fall back on the
     * empty box instead of displaying the broken image glyph. */
    private hasFailed = false;

    /* }}} */
    /* {{{ computed */

    /** The URL of the image, or `null` when the icon is a class name.
     *
     * Everything which follows the prefix is the URL, so that the `blob:`
     * and `data:` schemes are kept as they are. */
    get imageUrl(): string | null {
        const icon = this.icon;

        if (!icon.startsWith(IMAGE_PREFIX)) {
            return null;
        }

        return icon.slice(IMAGE_PREFIX.length);
    }

    get normalizedIcon(): string {
        const icon = this.icon;

        return icon.includes(':') ? icon : `raw:${icon}`;
    }

    get imageClass(): string {
        return `selectic-icon-space-after selectic__option-image `
             + this.className;
    }

    /* }}} */
    /* {{{ watch */

    /** Components are reused while the list scrolls or is filtered: a
     * failure must not outlive the URL which caused it. */
    @Watch('icon')
    protected onIconChange() {
        this.hasFailed = false;
    }

    /* }}} */
    /* {{{ methods */

    private onError() {
        this.hasFailed = true;
    }

    /* }}} */

    public render() {
        const url = this.imageUrl;

        if (url !== null) {
            /* The box is rendered even without a usable URL, so that the
             * option stays aligned with the ones having an image. */
            if (!url || this.hasFailed) {
                return (
                    <span class={this.imageClass} aria-hidden="true" />
                );
            }

            return (
                <img
                    class={this.imageClass}
                    src={url}
                    /* the text of the option already carries the name: a
                     * description here would be read twice */
                    alt=""
                    aria-hidden="true"
                    on={{
                        error: this.onError,
                    }}
                />
            );
        }

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
