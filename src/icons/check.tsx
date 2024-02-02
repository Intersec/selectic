/* This icon is from <https://github.com/Templarian/MaterialDesign>,
 * distributed under Apache 2.0 (https://www.apache.org/licenses/LICENSE-2.0) license
 */

import {Vue, Component, h} from 'vtyx';

export interface Props {}

@Component
export default class IconCheck extends Vue<Props> {
    public render() {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
            >
                <path
                    d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"
                />
            </svg>
        );
    }
}
