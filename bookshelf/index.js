const knex = require('knex')({
    'client': 'mysql',
    'connection': {
        'user': 'foo',
        'password': 'bar',
        'database': 'poster_shop'
    }
})

const bookshelf = require('bookshelf')(knex);

module.exports = bookshelf;