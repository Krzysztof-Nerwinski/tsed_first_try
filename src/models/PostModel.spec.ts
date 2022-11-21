import { PostModel } from './PostModel';
import { MongooseModel } from '@tsed/mongoose';
import { PlatformTest } from '@tsed/common';
import SuperTest from 'supertest';
import { TestMongooseContext } from '@tsed/testing-mongoose';
import { Server } from '../Server';
import { PlatformExpress } from '@tsed/platform-express';
import { PostController } from '../controllers/rest';

describe('PostModel', () => {
    beforeEach(
        TestMongooseContext.bootstrap(Server, {
            platform: PlatformExpress,
            mongod: {
                replicaSet: true,
            },
            mount: {
                '/': [PostController],
            },
        })
    ); // Create a server with mocked database
    beforeEach((done) => {
        request = SuperTest(PlatformTest.callback());
        done();
    });

    afterEach(TestMongooseContext.reset);
    let request: SuperTest.SuperTest<SuperTest.Test>;

    it('should test data assignment', () => {
        const postModel = PlatformTest.get<MongooseModel<PostModel>>(PostModel);
        // const instance = PlatformTest.invoke<PostModel>(PostModel); // get fresh instance

        const post = new postModel({
            title: 'test title',
            body: 'test contents',
        });

        expect(post.title).toEqual('test title');
        expect(post.body).toEqual('test contents');
    });

    it('should save a single post', async () => {
        const postModel = PlatformTest.get<MongooseModel<PostModel>>(PostModel);
        const post = new postModel({
            title: 'test title',
            body: 'test contents',
        });
        const existingPost = await post.save();
        const response = await request.get('/posts').expect(200);

        expect(response.body).toEqual([existingPost.toJSON()]);
    });
});
