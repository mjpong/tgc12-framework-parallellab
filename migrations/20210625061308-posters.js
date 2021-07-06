'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('posters',{
      id: { type: 'int', primaryKey:true, autoIncrement:true},
      title: { type: 'string', length:100},
      cost: 'int',
      description:'text',
      date: 'date',
      stock: 'int',
      height: 'int',
      width: 'int'
  })
};

exports.down = function(db) {
  return db.dropTable('posters');
};

exports._meta = {
  "version": 1
};
