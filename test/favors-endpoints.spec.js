const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Favors Endpoints', function() {
  let db;

  const {
    testUsers,
    testFavors,
  } = helpers.makeFavorsFixtures();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe(`GET /api/favors`, () => {
    context(`Given no favors`, () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/favors')
          .expect(200, []);
      });
    });

    context('Given there are favors in the database', () => {
      beforeEach('insert Favors', () => 
        helpers.seedFavorsTables(
          db,
          testUsers,
          testFavors,
        )
      );

      it('responds with 200 and all of the favors', () => {
        const expectedFavors = testFavors.map(favor =>
          helpers.makeExpectedFavor(
            favor
          )
        );
        return supertest(app)
          .get('/api/favors')
          .expect(200, expectedFavors);
      });
    });

    context(`Given an XSS attack favor`, () => {
      const testUser = helpers.makeUsersArray()[1];
      const {
        maliciousFavor,
        expectedFavor,
      } = helpers.makeMaliciousFavor(testUser);

      beforeEach('insert malicious favor', () => {
        return helpers.seedMaliciousFavor(
          db,
          testUser,
          maliciousFavor,
        );
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/favors`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].favor_title).to.eql(expectedFavor.favor_title);
            expect(res.body[0].favor_content).to.eql(expectedFavor.favor_content);
          });
      });
    });
  });

  describe(`GET /api/favors/:favorId`, () => {
    context('Given no favors', () => {
      beforeEach(() =>
        helpers.seedUsers(db, testUsers)
      );

      it('responds with 404', () => {
        const favorId = 123456;
        return supertest(app)
          .get(`/api/favors/${favorId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `Favor doesn't exist` });
      });
    });

    context('Given there are favors in the database', () => {
      beforeEach('insert favors', () =>
        helpers.seedFavorsTables(
          db,
          testUsers,
          testFavors,
        )
      );

      it('responds with 200 and the specified favor', () => {
        const favorId = 2;
        const expectedFavor = helpers.makeExpectedFavor(
          testFavors[favorId - 1],
        );

        return supertest(app)
          .get(`/api/favors/${favorId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedFavor);
      });
    });

    context(`Given an XSS attack favor`, () => {
      const testUser = helpers.makeUsersArray()[1];
      const {
        maliciousFavor,
        expectedFavor,
      } = helpers.makeMaliciousFavor(testUser);

      beforeEach('insert malicious favor', () => {
        return helpers.seedMaliciousFavor(
          db,
          testUser,
          maliciousFavor,
        );
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/favors/${maliciousFavor.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body.favor_title).to.eql(expectedFavor.favor_title);
            expect(res.body.favor_content).to.eql(expectedFavor.favor_content);
          });
      });
    });
  });
});