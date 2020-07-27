const xss = require('xss')

const FavorsService = {
  getAllFavors(db){
    return db
      .select('*')
      .from('favors')
  },
  getAllUserFavors(db, user_id){
    return db
      .select('*')
      .from('favors')
      .where({ user_id })
  },
  getFavorById(db, id){
    return db
      .from('favors')
      .select('*')
      .where('id', id)
      .first()
  },
  insertFavor(db, newFavor){
    return db 
      .insert(newFavor)
      .into('favors')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  patchFavor(db, id, newFavorFields){
    return db('favors')
      .where({ id })
      .update(newFavorFields)
  },
  deleteFavor(Db, id){
    return db('favors')
      .where({ id })
      .delete();
  },
  serializeFavor(favor){
    return {
      id: favor.id,
      to_user_id: favor.to_user_id,
      from_user_id: favor.from_user_id,
      favor_title: xss(favor.favor_title),
      favor_content: xss(favor.favor_content)
    }
  }
};

module.exports = FavorsService;