const bookshelf = require('../bookshelf')

const Poster = bookshelf.model('Poster', {
    tableName:'posters',
    category() {
        return this.belongsTo("Category")
    }
});

const Category = bookshelf.model("Category", {
    tableName: 'categories',
    products(){
        return this.hasMany('Product')
    }

})

module.exports = { Poster, Category };