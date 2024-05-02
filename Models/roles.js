class Role {
    constructor(db) {
    //   const db = require('./db');  
      this.db = db
    }
  
    async getRoleById(roleId) {
        const query = "SELECT * FROM roles WHERE role_id = $1";
        const values = [roleId];
        const result = await this.db.query(query, values);
        return result.rows[0];
      }
    
      async getRoleByName(roleName) {
        const query = "SELECT * FROM roles WHERE role_name = $1";
        const values = [roleName];
        const result = await this.db.query(query, values);
        return result.rows[0];
      }
    
      async getRoles() {
        const query = "SELECT * FROM roles";
        const result = await this.db.query(query);
        return result.rows;
    }
  }

module.exports = Role;