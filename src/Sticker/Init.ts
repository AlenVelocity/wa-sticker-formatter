import { IConfig } from '../typings'
import Base from './Base'
import { exec } from 'child_process'
import util from 'util'

export default class Init extends Base {
    /**
     * Creates a new instance of the this Class
     * @param data
     * @param param1
     */
    constructor(image: string | Buffer, config?: IConfig) {
        super()
        this.config = config
            ? config
            : {
                  pack: 'Made Using',
                  author: 'Wa Sticker Formatter'
              }
        this.data = image
    }

    exec = util.promisify(exec)
}
