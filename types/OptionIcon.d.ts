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
    /** Set when the browser cannot load the image, to fall back on the
     * empty box instead of displaying the broken image glyph. */
    private hasFailed;
    /** The URL of the image, or `null` when the icon is a class name.
     *
     * Everything which follows the prefix is the URL, so that the `blob:`
     * and `data:` schemes are kept as they are. */
    get imageUrl(): string | null;
    get normalizedIcon(): string;
    get imageClass(): string;
    /** Components are reused while the list scrolls or is filtered: a
     * failure must not outlive the URL which caused it. */
    protected onIconChange(): void;
    private onError;
    render(): h.JSX.Element | undefined;
}
