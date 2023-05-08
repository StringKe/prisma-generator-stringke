export const defaultOptions = {
    output: './',
    graphql: true,
    graphqlOutputPath: './graphql',
    graphqlOutputName: 'database.graphql',
    databaseComment: true,
    databaseCommentOutputPath: './sql',
    databaseCommentOutputName: 'database-comment.sql',
}

export declare type Options = typeof defaultOptions
