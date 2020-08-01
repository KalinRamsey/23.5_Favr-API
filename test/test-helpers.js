const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
    return [{
            id: 1,
            username: 'test-user-1',
            email: 'test@test.com',
            password: 'Password123!',
            about_me: 'Test about me section',
            img_link: 'https://img.favpng.com/17/16/19/photography-exhaust-manifold-desktop-wallpaper-png-favpng-q20h69K26epQpvjqQVhxQ8F3G.jpg',
            date_created: new Date('2029-01-22T16:28:32.615Z'),
        },
        {
            id: 2,
            username: 'test-user-2',
            email: 'test_user2@test.com',
            password: 'TestPass321!',
            about_me: 'About me test 2',
            img_link: 'https://partnerslocal.com/wp-content/plugins/bne-directory/assets/images/banner-fallback.jpg',
            date_created: new Date('2008-01-22T16:28:32.615Z'),
        },
        {
            id: 3,
            username: 'test-user-3',
            email: 'test_user3@test.com',
            password: 'LetM3In!',
            about_me: 'Another bit about me',
            img_link: 'https://i.pinimg.com/originals/c7/57/d8/c757d8d1ca706914af494878c26eeb34.png',
            date_created: new Date('2012-01-22T16:28:32.615Z'),
        }
    ];
};

function makeFavorsArray(users) {
    return [{
            id: 1,
            favor_title: 'Favor-1',
            favor_content: 'Favor 1 test content',
            from_user_id: users[0].id,
            to_user_id: users[2].id,
            completed: false,
            cancelled: false,
            assigned_date: '2012-01-22T16:28:32.615Z',
            end_date: null,
        },
        {
            id: 2,
            favor_title: 'Favor-2',
            favor_content: 'Favor 2 test content',
            from_user_id: users[1].id,
            to_user_id: users[2].id,
            completed: true,
            cancelled: false,
            assigned_date: '2012-01-22T16:28:32.615Z',
            end_date: '2029-01-22T16:28:32.615Z'
        },
        {
            id: 3,
            favor_title: 'Favor-3',
            favor_content: 'Favor 3 test content',
            from_user_id: users[2].id,
            to_user_id: users[0].id,
            completed: false,
            cancelled: true,
            assigned_date: '2012-01-22T16:28:32.615Z',
            end_date: '2029-01-22T16:28:32.615Z'
        },
        {
            id: 4,
            favor_title: 'Favor-4',
            favor_content: 'Favor 4 test content',
            from_user_id: users[2].id,
            to_user_id: users[1].id,
            completed: false,
            cancelled: false,
            assigned_date: '2012-01-22T16:28:32.615Z',
            end_date: null,
        }
    ]
}

function makeExpectedFavor(favor) {
    return {
        id: favor.id,
        favor_title: favor.favor_title,
        favor_content: favor.favor_content,
        from_user_id: favor.from_user_id,
        to_user_id: favor.to_user_id,
        completed: favor.completed,
        cancelled: favor.cancelled,
        assigned_date: favor.assigned_date,
        end_date: favor.end_date
    }
}

function makeMaliciousFavor(user) {
    const maliciousFavor = {
        id: 911,
        favor_title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        favor_content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        from_user_id: user.id,
        to_user_id: user.id
    };
    const expectedFavor = {
        ...makeExpectedFavor([user], maliciousFavor),
        favor_title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        favor_content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
    };
    return {
        maliciousFavor,
        expectedFavor,
    };
};

function makeFavorsFixtures() {
    const testUsers = makeUsersArray();
    const testFavors = makeFavorsArray(testUsers);

    return { testUsers, testFavors };
};

function cleanTables(db) {
    return db.transaction(trx =>
        trx.raw(
            `TRUNCATE
        users,
        favors
      `
        )
        .then(() =>
            Promise.all([
                trx.raw(`ALTER SEQUENCE favors_id_seq minvalue 0 START WITH 1`),
                trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
                trx.raw(`SELECT setval('favors_id_seq', 0)`),
                trx.raw(`SELECT setval('users_id_seq', 0)`),
            ])
        )
    );
};

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 1)
    }));

    return db
        .into('users')
        .insert(preppedUsers)
        .then(() =>
            // update the auto sequence to stay in sync
            db.raw(
                `SELECT setval('users_id_seq', ?)`, [users[users.length - 1].id],
            )
        );
};

function seedFavorsTables(db, users, favors) {
    // use a transaction to group the queries. auto rollback on any failures
    return db.transaction(async trx => {
        await seedUsers(trx, users);
        await trx.into('favors').insert(favors);
        // update the auto nce to match the rced id values
        await trx.raw(
            `SELECT setval('favors_id_seq', ?)`, [favors[favors.length - 1].id],
        );
    });
};

function seedMaliciousFavor(db, user, favor) {
    return seedUsers(db, [user])
        .then(() =>
            db
            .into('favors')
            .insert([favor])
        );
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id }, secret, {
        subject: user.username,
        algorithm: 'HS256',
    });
    return `Bearer ${token}`;
}

module.exports = {
    makeUsersArray,
    makeFavorsArray,
    makeExpectedFavor,
    makeMaliciousFavor,
    makeFavorsFixtures,
    cleanTables,
    seedFavorsTables,
    seedMaliciousFavor,
    makeAuthHeader,
    seedUsers,
};