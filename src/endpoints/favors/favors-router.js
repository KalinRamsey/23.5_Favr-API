const path = require('path');
const express = require('express');

const FavorsService = require('./favors-service');
const { requireAuth } = require('../middleware/jwt-auth');

const favorsRouter = express.Router();
const jsonParser = express.json();

favorsRouter
    .route('/')
    .get((req, res, next) => {
        FavorsService.getAllFavors(
                req.app.get('db')
            )
            .then(favors => {
                res.json(favors.map(FavorsService.serializeFavor));
            })
            .catch(next);
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { favor_title, favor_content } = req.body;
        const newFavor = { favor_title, favor_content };

        for (const [key, value] of Object.entries(newFavor))
            if (value == null)
                return res
                    .status(400)
                    .json({
                        error: `Missing '${key}' in request body`
                    });

        newFavor.to_user_id = req.body.to_user_id;
        newFavor.from_user_id = req.body.from_user_id;

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

favorsRouter
    .route('/:favorId')
    .all(checkFavorExists)
    .get((req, res) => {
        res.json(FavorsService.serializeFavor(res.favor));
    })
    .patch(requireAuth, jsonParser, (req, res, next) => {
        const { completed, cancelled, end_date } = req.body;
        const favorPatch = { completed, cancelled, end_date };

        const numOfValues = Object.values(favorPatch)
        if (numOfValues === 0) {
            return res
                .status(400)
                .json({
                    error: `Request body must contain either 'completed', 'end_date', or 'cancelled'`
                });
        }

        FavorsService.patchFavor(
                req.app.get('db'),
                req.params.favorId,
                favorPatch
            )
            .then(numRowsAffected => {
                res
                    .status(204)
                    .end();
            })
            .catch(next);
    })
    .delete(requireAuth, (req, res, next) => {
        FavorsService.deleteFavor(
                req.app.get('db'),
                req.params.favorId
            )
            .then(numRowsAffected => {
                res
                    .status(204)
                    .end();
            })
            .catch(next);
    })

async function checkFavorExists(req, res, next) {
    try {
        const favor = await FavorsService.getFavorByID(
            req.app.get('db'),
            req.params.favorId
        );

        if (!favor) {
            return res
                .status(404)
                .json({
                    error: `Favor doesn't exist`
                });
        }

        res.favor = favor;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = favorsRouter;