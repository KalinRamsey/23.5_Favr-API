const express = require('express');
const path = require('path');

const UsersService = require('./users-service');
const FavorsService = require('../favors/favors-service');

const { requireAuth } = require('../middleware/jwt-auth');

const usersRouter = express.Router();
const jsonParser = express.json();

usersRouter
    .route('/')
    .get((req, res, next) => {
        UsersService.getAllUsers(req.app.get('db'))
            .then(users => {
                res.json(users.map(UsersService.serializeUser))
            })
            .catch(next);
    })
    .post(jsonParser, (req, res, next) => {
        const { password, username, email } = req.body;

        for (const field of['email', 'username', 'password'])
            if (!req.body[field]) {
                return res
                    .status(400)
                    .json({
                        error: `Missing '${field}' in request body`
                    });
            }

        const usernameError = UsersService.validateUsername(username);
        if (usernameError) {
            return res
                .status(400)
                .json({
                    error: usernameError
                });
        }

        const passwordError = UsersService.validatePassword(password);
        if (passwordError) {
            return res
                .status(400)
                .json({
                    error: passwordError
                });
        }

        UsersService.hasUserWithUsername(
                req.app.get('db'),
                username
            )
            .then(hasUserWithUsername => {
                if (hasUserWithUsername)
                    return res
                        .status(400)
                        .json({
                            error: `Username already exists. Please select another.`
                        });

                return UsersService.hashPassword(password)
                    .then(hashedPassword => {
                        const newUser = {
                            username,
                            email,
                            password: hashedPassword,
                            about_me: req.body.about_me ? req.body.about_me : `Sample 'About Me' details for ${username}...`
                        };

                        return UsersService.insertUser(
                                req.app.get('db'),
                                newUser
                            )
                            .then(user => {
                                res
                                    .status(201)
                                    .location(path.posix.join(req.originalUrl, `/${user.id}`))
                                    .json(UsersService.serializeUser(user))
                            });
                    })
            })
            .catch(next);
    })

usersRouter
    .route('/:userId')
    .all(checkUserExists)
    .get((req, res) => {
        res.json(UsersService.serializeUser(res.user));
    })
    .patch(requireAuth, jsonParser, (req, res, next) => {
        const { about_me, img_link, date_modified } = req.body;
        const userPatch = { about_me, img_link, date_modified };

        const numOfValues = Object.values(userPatch);
        if (numOfValues === 0) {
            return res
                .status(400)
                .json({
                    error: `Request body must contain either 'about_me' or 'img_link'`
                });
        }

        UsersService.patchUser(
                req.app.get('db'),
                req.params.userId,
                userPatch
            )
            .then(numRowsAffected => {
                res
                    .status(204)
                    .end();
            })
            .catch(next);
    })
    .delete(requireAuth, (req, res, next) => {
        UsersService.deleteUser(
                req.app.get('db'),
                req.params.userId
            )
            .then(numRowsAffected => {
                res
                    .status(204)
                    .end();
            })
            .catch(next);
    })

usersRouter
    .route('/:userId/favors')
    .all(checkUserExists)
    .get((req, res, next) => {
        FavorsService.getAllUserFavors(
                req.app.get('db'),
                req.params.userId
            )
            .then(favors => {
                res
                    .json(favors.map(FavorsService.serializeFavor));
            })
            .catch(next);
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { favor_title, favor_content } = req.body;
        const newFavor = { favor_title, favor_content };

        for (const [key, value] of Object.entries(newFavor))
            if (value == null) {
                return res.status(400).json({
                    error: `Missing'${key}' in request body`
                });
            }

        newFavor.to_user_id = req.body.to_user_id;
        newFavor.from_user_id = req.params.userId;

        FavorsService.insertFavor(
                req.app.get('db'),
                newFavor
            )
            .then(favor => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${favor.id}`))
                    .json(FavorsService.serializeFavor(favor));
            })
            .catch(next);
    })

async function checkUserExists(req, res, next) {
    try {
        const user = await UsersService.getUserByID(
            req.app.get('db'),
            req.params.userId
        );

        if (!user) {
            return res
                .status(404)
                .json({
                    error: `User doesn't exist`
                });
        }

        res.user = user;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = usersRouter;