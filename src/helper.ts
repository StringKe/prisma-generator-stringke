import { promises as fs } from 'fs'
import { join } from 'path'

export default class Helper {
    public static async mkdir(dir: string) {
        await fs.mkdir(dir, { recursive: true })
    }

    public static async writeFile(path: string, data: string) {
        await this.mkdir(join(path, '..'))
        await fs.writeFile(path, data)
    }

    public static comment(comment?: string) {
        return comment ? [`"""`, comment, `"""`].join('\n') : ''
    }
}
