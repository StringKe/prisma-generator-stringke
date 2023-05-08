import { GeneratorOptions } from '@prisma/generator-helper'
import { logger, parseEnvValue } from '@prisma/internals'
import Helper from '../helper'
import { defaultOptions } from '../options'
import { generateGraphql } from '../generator/graphql'
import { generateDatabaseComment } from '../generator/database-comment'

export async function generate(options: GeneratorOptions) {
    const { output, config } = options.generator

    const generatorOptions = Object.assign({}, defaultOptions, {
        output: parseEnvValue(output!) || './',
        graphql: config.graphql !== 'false',
        graphqlOutputPath:
            config.graphqlOutputPath || defaultOptions.graphqlOutputPath,
        graphqlOutputName:
            config.graphqlOutputName || defaultOptions.graphqlOutputName,
        databaseComment: config.databaseComment !== 'false',
        databaseCommentOutputPath:
            config.databaseCommentOutputPath ||
            defaultOptions.databaseCommentOutputPath,
    })

    try {
        await Helper.mkdir(generatorOptions.output)

        logger.info('Output: ' + generatorOptions.output)

        if (generatorOptions.graphql) {
            await generateGraphql(generatorOptions, options)
        }
        if (generatorOptions.databaseComment) {
            await generateDatabaseComment(generatorOptions, options)
        }
    } catch (e) {
        console.error('Error: unable to write files for Prisma DBML Generator')
        throw e
    }
}
