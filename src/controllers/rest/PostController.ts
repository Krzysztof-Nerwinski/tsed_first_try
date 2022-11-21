import { Controller, Inject } from '@tsed/di';
import { Delete, Get, Patch, Post, Returns } from '@tsed/schema';
import { PartialPostModel, PostModel } from '../../models/PostModel';
import { BodyParams, PathParams, QueryParams } from '@tsed/platform-params';
import { PostService } from '../../services/PostService';
import { FilterQuery } from 'mongoose';
import { BadRequest, InternalServerError } from '@tsed/exceptions';
import { Res } from '@tsed/common';

export class EmptyResponse {}

@Controller('/posts')
export class PostController {
    @Inject(PostService) private service: PostService;
    @Inject(PostModel) private post: PostModel;

    @Get('/')
    @Returns(200, PostModel)
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
    @Returns(200, PostModel)
    @Returns(400)
    @Returns(404)
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
    @Returns(201, PostModel)
    @Returns(400)
    async create(@BodyParams() model: PostModel): Promise<PostModel> {
        return this.service.create(model);
    }

    @Patch('/:id')
    @Returns(200, PostModel)
    @Returns(400)
    @Returns(404)
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
    @Returns(200, EmptyResponse)
    @Returns(400)
    @Returns(404)
    async deleteById(
        @PathParams('id') id: string,
        @Res() response: Res
    ): Promise<void> {
        try {
            const deleteResult = await this.service.delete(id);
            if (deleteResult.deletedCount !== 0) {
                response.status(200).send();
            } else {
                response.status(404).send();
            }
        } catch (e) {
            if (e.name == 'CastError') {
                throw new BadRequest('Invalid id');
            }
        }
    }
}
