const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const { makeNoteArray } = require('./note.fixtures');
const { makeFolderArray } = require('./folder.fixtures');

describe('Note Endpoints', () => {
    let db;

    before('Make the knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL
        });
        app.set('db', db);
    });

    after('disconnect from the database', () => db.destroy());

    before('clean the note table', () => db('note').truncate());
    before('clean the folder table', () => db.raw('TRUNCATE folder RESTART IDENTITY CASCADE'));

    afterEach('cleanup note', () => db('note').truncate());
    afterEach('cleanup folder', () => db.raw('TRUNCATE folder RESTART IDENTITY CASCADE'));

    describe('GET /api/note', () => {
        context('given no notes in the folder', () => {
            it('returns a 200 and an empty array', () => {
                return supertest(app)
                    .get('/api/note')
                    .expect(200, []);
            });
        });

        context('given note in folder', () => {
            const testFolders = makeFolderArray();
            const testNote = makeNoteArray();

            beforeEach('Add Folders', () => {
                return db.into('folder')
                    .insert(testFolders);
            });

            beforeEach('add note', () => {
                return db.into('note')
                    .insert(testNote);
            });

            it('returns a 200 and all note', () => {
                return supertest(app)
                    .get('/api/note')
                    .expect(200, testNote);
            });
        });
    });

    describe('GET api/note/:note_id', () => {
        context('when there are no notes in the database', () => {
            it('returns a 404 and an error for the note', () => {
                const testId = 1612;

                return supertest(app)
                    .get(`/api/note/${testId}`)
                    .expect(404)
                    .expect({
                        error: { message: 'Note does not exist' }
                    });
            });
        });
    });

    describe('POST /api/note', () => {
        const testFolders = makeFolderArray();

        beforeEach('Add Folders', () => {
            return db.into('folder')
                .insert(testFolders);
        });

        it('returns a 201 when a the test note has been passed through', () => {
            const newNote = {
                note_name: 'Test Note',
                content: 'Test Content',
                assigned_folder: 2,
            };

            return supertest(app)
                .post('/api/note')
                .send(newNote)
                .expect(201)
                .expect(res => {
                    expect(res.body.note_name).to.eql(newNote.note_name);
                    expect(res.body.content).to.eql(newNote.content);
                    expect(res.body.assigned_folder).to.eql(Number(newNote.assigned_folder));
                    expect(res.body).to.have.property('id');
                })
                .then(postRes => {
                    return supertest(app)
                        .get(`/api/note/${postRes.body.id}`)
                        .expect(postRes.body);
                });
        });

        const requiredFields = ['note_name', 'content', 'assigned_folder'];
        requiredFields.forEach(field => {
            const newNote = {
                note_name: 'test note',
                content: 'please ignore',
                assigned_folder: 2
            };

            it(`responds with a 400 and an error message when the '${field}' is missing`, () => {
                delete newNote[field];

                return supertest(app)
                    .post('/api/note')
                    .send(newNote)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body` }
                    });
            });
        });
    });

    describe('DELETE /api/note/:note_id', () => {
        context('When there are no notes in the database', () => {
            it('returns a 404 and associate error', () => {
                const testId = 1612;
                return supertest(app)
                    .delete(`/api/note/${testId}`)
                    .expect(404)
                    .expect({
                        error: { message: 'Note does not exist' }
                    });
            });
        });

        context('When there are folders and notes in the database', () => {
            const testFolders = makeFolderArray();

            beforeEach('add folders to the database', () => {
                return db.into('folder')
                    .insert(testFolders);
            });

            beforeEach('add notes to database', () => {
                const testNotes = makeNoteArray();
                return db.into('note')
                    .insert(testNotes);
            });

            it('returns a 204 and the note is not in a get request', () => {
                const testNotes = makeNoteArray();
                const idToRemove = 2;
                const expectedArray = testNotes.filter(note => note.id != idToRemove);

                return supertest(app)
                    .delete(`/api/note/${idToRemove}`)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/note`)
                            .expect(200, expectedArray)
                    );
            });
        });
    });
});