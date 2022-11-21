import { PlatformTest } from '@tsed/common';
import SuperTest from 'supertest';
import { PostController } from './PostController';
import { Server } from '../../Server';
import { TestMongooseContext } from '@tsed/testing-mongoose';
import { PlatformExpress } from '@tsed/platform-express';
import { MongooseModel } from '@tsed/mongoose';
import { PostModel } from '../../models/PostModel';

describe('PostController', () => {
    let request: SuperTest.SuperTest<SuperTest.Test>;
    const validId = '63774fd1811838580e655b11';
    const invalidId = 'invalid id';

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

    it('should call GET /posts when empty', async () => {
        const response = await request.get('/posts').expect(200);

        expect(response.body).toEqual([]);
    });

    it('should call GET /posts when posts exists', async () => {
        const posts = await generateAndSavePosts(5);
        const response = await request.get('/posts').expect(200);
        expect(response.body).toEqual(posts.map((post) => post.toJSON()));
    });

    it('should test GET /posts limit query parameter', async () => {
        const limit = 2;
        const posts = await generateAndSavePosts(5);
        expect(posts.length).toEqual(5);
        const response = await request.get(`/posts?limit=${limit}`).expect(200);
        expect(response.body.length).toEqual(limit);
    });

    it('should test GET /posts search title query parameter', async () => {
        const searchedTitle = '1';
        const posts = await generateAndSavePosts(2);
        expect(posts[1].title).toEqual('post 1 title');
        const response = await request
            .get(`/posts?title=${searchedTitle}`)
            .expect(200);
        expect(response.body.length).toEqual(1);
        expect(response.body[0].title).toEqual('post 1 title');
    });

    it('should test GET /posts search body query parameter', async () => {
        const searchedBody = '1';
        const posts = await generateAndSavePosts(2);
        expect(posts[1].body).toEqual('post 1 content');
        const response = await request
            .get(`/posts?body=${searchedBody}`)
            .expect(200);
        expect(response.body.length).toEqual(1);
        expect(response.body[0].body).toEqual('post 1 content');
    });

    it('should call GET /posts/:id when post does not exist', async () => {
        await request.get(`/posts/${validId}`).expect(404);
    });

    it('should call GET /posts/:id with invalid id param', async () => {
        await request.get(`/posts/${invalidId}`).expect(400);
    });

    it('should call GET /posts/:id when post exists', async () => {
        const post = (await generateAndSavePosts(1))[0];
        const response = await request.get(`/posts/${post.id}`).expect(200);
        expect(response.body).toEqual(post.toJSON());
    });

    it('should call POST /posts with too short title', async () => {
        const postData = {
            title: 'in',
            body: 'valid body',
        };
        const response = await request
            .post('/posts')
            .send(postData)
            .expect(400);
        expect(response.body.message).toEqual(
            'Bad request on parameter "request.body".\n' +
                'PostModel.title must NOT have fewer than 3 characters. Given value: "in"'
        );
        expect(response.body.errors[0]).toEqual({
            instancePath: '/title',
            schemaPath: '#/properties/title/minLength',
            keyword: 'minLength',
            params: { limit: 3 },
            message: 'must NOT have fewer than 3 characters',
            data: 'in',
            modelName: 'PostModel',
            dataPath: '.title',
        });
    });
    it('should call POST /posts with too long title', async () => {
        const postData = {
            title: 'a'.repeat(70),
            body: 'valid body',
        };
        const response = await request
            .post('/posts')
            .send(postData)
            .expect(400);
        expect(response.body.message).toEqual(
            'Bad request on parameter "request.body".\n' +
                `PostModel.title must NOT have more than 60 characters. Given value: "${postData.title}"`
        );
        expect(response.body.errors[0]).toEqual({
            instancePath: '/title',
            schemaPath: '#/properties/title/maxLength',
            keyword: 'maxLength',
            params: { limit: 60 },
            message: 'must NOT have more than 60 characters',
            data: postData.title,
            modelName: 'PostModel',
            dataPath: '.title',
        });
    });

    it('should call POST /posts with invalid body', async () => {
        const postData = {
            title: 'valid title',
            body: ['invalid body', 'invalid body'],
        };
        const response = await request
            .post('/posts')
            .send(postData)
            .expect(400);
        expect(response.body.message).toEqual(
            'Bad request on parameter "request.body".\n' +
                'PostModel.body must be string. Given value: ["invalid body","invalid body"]'
        );
        expect(response.body.errors[0]).toEqual({
            instancePath: '/body',
            schemaPath: '#/properties/body/type',
            keyword: 'type',
            params: { type: 'string' },
            message: 'must be string',
            data: postData.body,
            modelName: 'PostModel',
            dataPath: '.body',
        });
    });

    it('should call POST /posts and create a post', async () => {
        const postModel = PlatformTest.get<MongooseModel<PostModel>>(PostModel);
        const postData = {
            title: 'valid title',
            body: 'valid body',
        };
        const response = await request
            .post('/posts')
            .send(postData)
            .expect(201);
        expect(response.body.title).toEqual(postData.title);
        expect(response.body.body).toEqual(postData.body);
        const createdPost = await postModel.findOne(postData);
        expect(createdPost).toHaveProperty('title', postData.title);
        expect(createdPost).toHaveProperty('body', postData.body);
    });

    it('should call PATCH /posts and update a post title', async () => {
        const postModel = PlatformTest.get<MongooseModel<PostModel>>(PostModel);
        const posts = await generateAndSavePosts(1);
        const newTitle = 'some random new post title';
        const response = await request
            .patch(`/posts/${posts[0].id}`)
            .send({
                title: newTitle,
            })
            .expect(200);
        expect(response.body).toEqual({
            id: posts[0].id,
            title: newTitle,
            body: posts[0].body,
        });
        const updatedPost = await postModel.findOne(response.body);
        expect(updatedPost).toHaveProperty('title', newTitle);
        expect(updatedPost).toHaveProperty('body', posts[0].body);
    });

    it('should call DELETE /posts and return a 400', async () => {
        await request.delete(`/posts/${invalidId}`).send().expect(400);
    });

    it('should call DELETE /posts and return a 404', async () => {
        await request.delete(`/posts/${validId}`).send().expect(404);
    });

    it('should call DELETE /posts and delete a post', async () => {
        const posts = await generateAndSavePosts(1);
        await request.delete(`/posts/${posts[0].id}`).send().expect(200);
    });
});

const generateAndSavePosts = async (amount: number) => {
    const posts = generatePosts(amount);
    for (const post of posts) {
        await post.save();
    }
    return posts;
};

const generatePosts = (amount: number) => {
    const postModel = PlatformTest.get<MongooseModel<PostModel>>(PostModel);
    return Array.from(Array(amount).keys()).map(
        (n) =>
            new postModel({
                title: `post ${n} title`,
                body: `post ${n} content`,
            })
    );
};
