/* This icon is from <https://github.com/Templarian/MaterialDesign>,
 * distributed under Apache 2.0 (https://www.apache.org/licenses/LICENSE-2.0) license
 */

import {Vue, Component, h} from 'vtyx';

export interface Props {}

@Component
export default class IconTimes extends Vue<Props> {
    public render() {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
            >
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
        );
    }
}