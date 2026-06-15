const { Model } = require('objection');
const db = require('../config/db');

Model.knex(db);

class BaseModel extends Model {
  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }
}





module.exports = BaseModel;




// Model.knex(db) → Objection ko batata hai ki Knex connection kaunsa use karna hai

// BaseModel → Har model isse extend karega — created_at/updated_at automatically set ho jaayenge

// $beforeInsert / $beforeUpdate → Hooks — insert/update se pehle automatically chalte hain