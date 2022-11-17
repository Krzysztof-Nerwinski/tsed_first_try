import { Controller, Inject } from '@tsed/di';
import { Delete, Get, Patch, Post } from '@tsed/schema';
import { PartialPostModel, PostModel } from '../../models/PostModel';
import { BodyParams, PathParams, QueryParams } from '@tsed/platform-params';
import { PostService } from '../../services/PostService';
import { FilterQuery } from 'mongoose';
import { BadRequest, InternalServerError } from '@tsed/exceptions';
import mongodb from 'mongodb';

@Controller('/posts')
export class PostController {
    @Inject(PostService) private service: PostService;

    @Get('/')
    async findAll(
        @QueryParams('limit') limit: number,
        @QueryParams('title') title: string,
        @QueryParams('body') body: string
    ) {
        const filterQuery: FilterQuery<PostModel> = {
            ...(title && {
                title: {
                    $regex: title,
                },
            }),
            ...(body && {
                body: {
                    $regex: body,
                },
            }),
        };
        return this.service.find(filterQuery, { limit });
    }

    @Get('/:id')
    async get(@PathParams('id') id: string): Promise<PostModel> {
        try {
            return await this.service.get(id);
        } catch (e) {
            switch (e.name) {
                case 'CastError':
                    throw new BadRequest('Invalid id');
                case 'NOT_FOUND':
                    throw e;
                default:
                    throw new InternalServerError('Unhandled error');
            }
        }
    }

    @Post('/')
    async create(@BodyParams() model: PostModel): Promise<PostModel> {
        return this.service.create(model);
    }

    @Patch('/:id')
    async patch(
        @PathParams('id') id: string,
        @BodyParams() dataToUpdate: PartialPostModel
    ): Promise<PostModel | null> {
        try {
            return await this.service.patch(id, dataToUpdate);
        } catch (e) {
            switch (e.name) {
                case 'CastError':
                    throw new BadRequest('Invalid id');
                case 'NOT_FOUND':
                    throw e;
                default:
                    throw new InternalServerError('Unhandled error');
            }
        }
    }
    @Delete('/:id')
    async deleteById(
        @PathParams('id') id: string
    ): Promise<mongodb.DeleteResult> {
        try {
            return await this.service.delete(id);
        } catch (e) {
            switch (e.name) {
                case 'CastError':
                    throw new BadRequest('Invalid id');
                case 'NOT_FOUND':
                    throw e;
                default:
                    throw new InternalServerError('Unhandled error');
            }
        }
    }
}
