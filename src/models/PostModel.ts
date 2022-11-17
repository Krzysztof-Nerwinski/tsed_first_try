import { Model, ObjectID } from '@tsed/mongoose';
import { MaxLength, MinLength, Optional, Required } from '@tsed/schema';

/**
 * ## How to inject model?
 *
 * ```typescript
 * import { MongooseModel } from "@tsed/mongoose";
 * import { Injectable, Inject } from "@tsed/di";
 *
 * @Injectable()
 * class MyService {
 *   @Inject(posts)
 *   model: MongooseModel<posts>;
 * }
 * ```
 */
@Model({
    name: 'posts',
    schemaOptions: {
        timestamps: true,
    },
})
export class PostModel {
    @ObjectID('id')
    _id: string;

    @Required()
    @MaxLength(60)
    @MinLength(3)
    title: string;

    @Required()
    body: string;
}

export class PartialPostModel {
    @Optional()
    @MaxLength(60)
    @MinLength(3)
    title: string;

    @Optional()
    body: string;
}
