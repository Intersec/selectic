/* This icon is from <https://github.com/Templarian/MaterialDesign>,
 * distributed under Apache 2.0 (https://www.apache.org/licenses/LICENSE-2.0) license
 */

import {Vue, Component, h} from 'vtyx';

export interface Props {}

@Component
export default class IconCaretDown extends Vue<Props> {
    public render() {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
            >
                <path d="M7,10L12,15L17,10H7Z" />
            </svg>
        );
    }
}
