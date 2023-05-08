import { generatorHandler } from '@prisma/generator-helper'

import { generate } from './stringke-generator'

generatorHandler({
    onManifest: () => ({
        defaultOutput: './',
        prettyName: 'Stringke Generator',
    }),
    onGenerate: generate,
})
