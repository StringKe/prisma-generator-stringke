import { Options } from '../options'
import { DMMF, GeneratorOptions } from '@prisma/generator-helper'
import { logger } from '@prisma/internals'
import path from 'path'
import Helper from '../helper'
import { GraphqlBasicSupportType } from '../keywords'

function generateTypes(data: DMMF.Document) {
    let scalarTypes: string[] = []

    const fullTypes = [...data.datamodel.types, ...data.datamodel.models]
    const fullTypeNames = fullTypes.map(({ name }) => name)

    let typeString = fullTypes
        .map(({ fields, documentation, name }) => {
            const typeFields = fields
                .map(
                    ({
                        name,
                        type,
                        isRequired,
                        isList,
                        documentation,
                        isId,
                    }) => {
                        const required = isRequired ? '!' : ''

                        const graphQLType = isId ? 'ID' : type

                        const combineType = isList
                            ? `[${graphQLType}]`
                            : graphQLType

                        if (!GraphqlBasicSupportType.includes(graphQLType)) {
                            scalarTypes.push(graphQLType)
                        }

                        const comment = Helper.comment(documentation)

                        return [
                            comment.length
                                ? `${comment
                                      .split('\n')
                                      .map((item) => {
                                          return `\t${item}`
                                      })
                                      .join('\n')}\n`
                                : undefined,
                            `\t${name}: ${combineType}${required}`,
                        ]
                            .filter(Boolean)
                            .join('')
                    },
                )
                .join('\n')

            return [
                `${Helper.comment(documentation)}`,
                `type ${name} {`,
                typeFields,
                '}',
            ]
                .filter(Boolean)
                .join('\n')
        })
        .join('\n\n')

    let scalarString = [...new Set(scalarTypes).values()]
        .map((item) => {
            return fullTypeNames.includes(item) ? undefined : `scalar ${item}`
        })
        .filter(Boolean)
        .join('\n')

    let enumString = data.datamodel.enums.map(
        ({ name, values, documentation }) => {
            const enumValues = values.map(({ name }) => `\t${name}`).join('\n')

            return [
                `${Helper.comment(documentation)}`,
                `enum ${name} {`,
                enumValues,
                '}',
            ]
                .filter(Boolean)
                .join('\n')
        },
    )

    return [scalarString, enumString, typeString].join('\n\n')
}

export async function generateGraphql(
    options: Options,
    generatorOptions: GeneratorOptions,
) {
    const fullPath = path.join(
        options.output,
        options.graphqlOutputPath,
        options.graphqlOutputName,
    )

    logger.info('Generating GraphQL schema')
    logger.info(`Output: ${fullPath}`)

    const template = generateTypes(generatorOptions.dmmf)

    await Helper.writeFile(fullPath, template)
}
