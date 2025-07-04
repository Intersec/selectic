import {Vue, Component, h} from 'vtyx';

export interface Props {}

@Component
export default class IconDot extends Vue<Props> {
    public render() {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
            >
                <circle cx="8" cy="16" r="3.5" />
            </svg>
        );
    }
}
