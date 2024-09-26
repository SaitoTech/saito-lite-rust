import {dirname} from 'path';
import {fileURLToPath} from 'url';

const filePath = fileURLToPath('');

export default dirname(dirname(dirname(filePath)));
