import { Vue } from 'vtyx';
import Store from './Store';
export interface Props {
    store: Store;
    icon: string;
    spin?: boolean;
    title?: string;
}
export default class Icon extends Vue<Props> {
    private store;
    private icon;
    private spin?;
    private title?;
    private get rawIconValue();
    private get family();
    private get iconValue();
    private get vueIcon();
    private get spinClass();
    private get spinActive();
    private renderInnerIcon;
    private renderSpanIcon;
    render(): import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>;
}
