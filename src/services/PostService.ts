import { Inject, Injectable, Service } from '@tsed/di';
import { PostModel } from '../models/PostModel';
import { MongooseModel } from '@tsed/mongoose';
import { FilterQuery, QueryOptions, QueryWithHelpers } from 'mongoose';
import { Logger } from '@tsed/logger';
import { NotFound } from '@tsed/exceptions';
import mongodb from 'mongodb';

@Injectable()
@Service()
export class PostService {
    @Inject(PostModel) private model: MongooseModel<PostModel>;
    @Inject(Logger) private logger: Logger;

    public async create(obj: PostModel): Promise<PostModel> {
        const post = new this.model(obj);
        await post.save();

        return post;
    }

    public async get(id: string): Promise<PostModel> {
        const post = await this.model.findById(id);
        if (post !== null) {
            return post as PostModel;
        } else {
            throw new NotFound('Not Found');
        }
    }

    public async find(
        filterQuery: FilterQuery<PostModel>,
        options: QueryOptions
    ): Promise<PostModel[]> {
        this.logger.info('query options in find all', options);
        this.logger.info('query params in find all', filterQuery);
        return this.model.find(filterQuery, undefined, options);
    }

    public async patch(
        postId: string,
        dataToUpdate: Partial<PostModel>
    ): Promise<PostModel> {
        const post = await this.model.findByIdAndUpdate(postId, dataToUpdate, {
            new: true,
        });
        if (post !== null) {
            return post as PostModel;
        } else {
            throw new NotFound('Not Found');
        }
    }

    public async delete(
        postId: string
    ): Promise<QueryWithHelpers<mongodb.DeleteResult, PostModel>> {
        return this.model.deleteOne({ _id: postId });
    }
}
