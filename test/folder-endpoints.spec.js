const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const { makeFolderArray, makeMaliciousImgFolder } = require('./folder.fixtures');

describe('Folder Endpoints', () => {
    let db;

    before('Make the knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL
        });
        app.set('db', db);
    });

    after('disconnect from the database', () => db.destroy());

    before('clean the table', () => db.raw('TRUNCATE folder RESTART IDENTITY CASCADE'));

    afterEach('cleanup', () => db.raw('TRUNCATE folder RESTART IDENTITY CASCADE'));

    describe('/GET /api/folder', () => {
        context('given no folder in the database', () => {
            it('returns a 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/folder')
                    .expect(200, []);
            });
        });

        context('given folder in the database', () => {
            const testFolder = makeFolderArray();

            beforeEach('insert folder', () => {
                return db.into('folder')
                    .insert(testFolder);
            });

            it('returns with a 200 and the array of folder', () => {
                return supertest(app)
                    .get('/api/folder')
                    .expect(200, testFolder);
            });
        });
    });

    describe('GET /api/folder/:folder_id', () => {
        context('given no folder in the database', () => {
            it('retuns a 404 and an error for the folder', () => {
                const testId = 1612;

                return supertest(app)
                    .get(`/api/folder/${testId}`)
                    .expect(404)
                    .expect({
                        error: { message: 'Folder does not exist' }
                    });
            });
        });

        context('given folder in the database', () => {
            const testFolder = makeFolderArray();

            beforeEach('insert folder', () => {
                return db.into('folder')
                    .insert(testFolder);
            });

            it('returns a 200 and the expected folder', () => {
                const testId = 2;
                const expectedFolder = testFolder[testId - 1];

                return supertest(app)
                    .get(`/api/folder/${testId}`)
                    .expect(200, expectedFolder);
            });
        });
    });

    describe('POST /api/folder', () => {
        it('creates a folder responding with a 201 then the new folder', () => {
            const newFolder = { folder_name: 'New Folder' };

            return supertest(app)
                .post('/api/folder')
                .send(newFolder)
                .expect(201)
                .expect(res => {
                    expect(res.body.folder_name).to.eql(newFolder.folder_name);
                    expect(res.body).to.have.property('id');
                })
                .then(postRes => {
                    return supertest(app)
                        .get(`/api/folder/${postRes.body.id}`)
                        .expect(postRes.body);
                });
        });

        it('rejectes a folder with no name, sending a 400 and error', () => {
            const emptyFolder = { folder_name: '' };

            return supertest(app)
                .post('/api/folder')
                .send(emptyFolder)
                .expect(400)
                .expect({
                    error: { message: `Missing folder name` }
                });
        });

        it('Sanitizes an xss attack', () => {
            const { maliciousImgFolder, expectedImgFolder } = makeMaliciousImgFolder();

            return supertest(app)
                .post('/api/folder')
                .send(maliciousImgFolder)
                .expect(201)
                .expect(res => {
                    expect(res.body.folder_name).to.eql(expectedImgFolder.folder_name);
                });
        });
    });

    describe('DELETE /api/folder/:folder_id', () => {
        context('given no folder in the database', () => {
            it('retuns a 404 and an error for the folder', () => {
                const testId = 1612;

                return supertest(app)
                    .delete(`/api/folder/${testId}`)
                    .expect(404)
                    .expect({
                        error: { message: 'Folder does not exist' }
                    });
            });
        });

        context('given folder in the database', () => {
            const testFolder = makeFolderArray();

            beforeEach('Add folder to the database', () => {
                return db.into('folder')
                    .insert(testFolder);
            });

            it('deletes the folder and returns a 204', () => {
                const testId = 2;
                const expectedFolder = testFolder.filter(folder => folder.id != testId);

                return supertest(app)
                    .delete(`/api/folder/${testId}`)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get('/api/folder')
                            .expect(expectedFolder)
                    );
            });
        });
    });

    describe('PATCH api/folder/:folder_id', () => {
        context('when there are no items in the database', () => {
            it('retuns a 404 and an error for the folder', () => {
                const testId = 1612;

                return supertest(app)
                    .patch(`/api/folder/${testId}`)
                    .expect(404)
                    .expect({
                        error: { message: 'Folder does not exist' }
                    });
            });
        });

        context('When items are in the database', () => {
            const testFolder = makeFolderArray();
            beforeEach('Add folder to database', () => {
                return db.into('folder')
                    .insert(testFolder);
            });

            it('updates the folder name with a 204', () => {
                const idToUpdate = 2;
                const updateFolder = {
                    folder_name: 'New Folder Name'
                };
                const expectedFolder = {
                    ...testFolder[idToUpdate - 1],
                    ...updateFolder
                };

                return supertest(app)
                    .patch(`/api/folder/${idToUpdate}`)
                    .send(updateFolder)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/folder/${idToUpdate}`)
                            .expect(expectedFolder)
                    )
            });

            it('returns a 400 and error when there is nothing to update', () => {
                const idToUpdate = 2;
                const updateFolder = {
                    folder_name: ''
                };
                const expectedFolder = {
                    ...testFolder[idToUpdate - 1],
                    ...updateFolder
                };

                return supertest(app)
                    .patch(`/api/folder/${idToUpdate}`)
                    .send(updateFolder)
                    .expect(400)
                    .expect({
                        error: {
                            message: 'Request body must contain a valid folder_name'
                        }
                    });
            });
        });
    });
});