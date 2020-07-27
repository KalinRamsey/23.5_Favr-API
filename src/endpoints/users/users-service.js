const bcrypt = require('bcryptjs')
const xss = require('xss')

const FavorService = require('../favors/favors-service')
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UsersService = {
  hasUserWithUsername(db, username){
    return db('users')
      .where({ username })
      .first()
      .then(user => !!user)
  },
  getAllUsers(db){
    return db
      .from('users')
      .select('*')
  },
  getUserByID(db, id){
    return UsersService.getAllUsers()
      .where({ id })
      .first()
  },
  insertUser(db, newUser){
    return db
      .insert(newUser)
      .into('users')
      .returning('*')
      .then(([ user ]) => user)
  },
  patchUser(db, id, newUserFields){
    return db('users')
      .where({ id })
      .update(newUserFields)
  },
  deleteUser(db, id){
    return db('users')
      .where({ id })
      .delete()
  },
  validateUsername(username){
    if (username.startsWith(' ') || username.endsWith(' ')){
      return 'Username must not start or end with empty spaces'
    }
    return null
  },
  validatePassword(password){
    if (password.length < 8){
      return 'Password must be longer than 8 characters'
    }
    if (password.length > 72){
      return 'Password must be less than 72 characters'
    }
    if (password.startsWith(' ') || password.endsWith(' ')){
      return 'Password must not start or end with empty spaces'
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)){
      return 'Password must contain one uppercase, lowercase, number, and special character'
    }
    return null
  },
  hashPassword(password){
    return bcrypt.hash(password, 12)
  },
  serializeUser(user){
    return {
      id: user.id,
      username: xss(user.username),
      about_me: xss(user.about_me),
      date_created: new Date(user.date_created),
    }
  }
}

module.exports = UsersService