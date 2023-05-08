import { Options } from '../options'
import { DataSource, DMMF, GeneratorOptions } from '@prisma/generator-helper'
import { logger } from '@prisma/internals'
import path, { join } from 'path'
import Helper from '../helper'

function comments(data: DMMF.Model[], database: DataSource['provider']) {
    return data
        .map(({ name: tableName, fields, documentation }) => {
            const fieldString = fields
                .map(({ name, documentation }) => {
                    if (documentation) {
                        switch (database) {
                            case 'mysql':
                                return (
                                    `ALTER TABLE ${tableName} ` +
                                    `MODIFY ${name} TYPE COMMENT '${documentation}'`
                                )
                            case 'postgresql':
                            case 'postgres':
                                return `COMMENT ON COLUMN ${tableName}.${name} IS '${documentation}'`
                            case 'sqlserver':
                            case 'jdbc:sqlserver':
                                return `EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'${documentation}', @level0type=N'SCHEMA', @level0name=N'dbo', @level1type=N'TABLE', @level1name=N'${tableName}', @level2type=N'COLUMN', @level2name=N'${name}'`
                            case 'cockroachdb':
                                return `COMMENT ON COLUMN ${tableName}.${name} IS '${documentation}'`
                            case 'mongodb':
                                return undefined
                            case 'sqlite':
                                return undefined
                            default:
                                return undefined
                        }
                    }
                    return undefined
                })
                .filter(Boolean)
                .map((item) => `${item};`)
                .join('\n')

            if (documentation) {
                const tableComment = (() => {
                    switch (database) {
                        case 'mysql':
                            return (
                                `ALTER TABLE ${tableName} ` +
                                `COMMENT '${documentation}'`
                            )
                        case 'postgresql':
                        case 'postgres':
                            return `COMMENT ON TABLE ${tableName} IS '${documentation}'`
                        case 'sqlserver':
                        case 'jdbc:sqlserver':
                            return `EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'${documentation}', @level0type=N'SCHEMA', @level0name=N'dbo', @level1type=N'TABLE', @level1name=N'${tableName}'`
                        case 'cockroachdb':
                            return `COMMENT ON TABLE ${tableName} IS '${documentation}'`
                        case 'sqlite':
                            return `PRAGMA table_info(${tableName})`
                        default:
                            return undefined
                    }
                })()
                return [fieldString, `${tableComment};`].join('\n')
            }
            if (fieldString.length) {
                return fieldString
            }
            return ''
        })
        .filter(Boolean)
        .join('\n')
}

export async function generateDatabaseComment(
    options: Options,
    generatorOptions: GeneratorOptions,
) {
    const fullPath = path.join(
        options.output,
        options.databaseCommentOutputPath,
    )

    logger.info('Generating database comment')
    logger.info(`Output: ${fullPath}`)

    const all = generatorOptions.datasources.map(async (datasource) => {
        const result = comments(
            generatorOptions.dmmf.datamodel.models,
            datasource.provider,
        )

        const outputPath = path.join(
            fullPath,
            `${datasource.provider}-${options.databaseCommentOutputName}`,
        )
        await Helper.writeFile(outputPath, result)
    })

    await Promise.all(all)
}
