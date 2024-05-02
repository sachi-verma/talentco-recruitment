class Permissions {
    constructor(db) {
      this.db = db 
    }
  
    async getPermissionById(permissionId) {
        const query = "SELECT * FROM permissions WHERE id = $1";
        const values = [permissionId];
        const result = await this.db.query(query, values);
        return result.rows[0];
      }
    
      async getPermissionsByRoleAndModule(roleId, moduleId) {
        const query = "SELECT * FROM permissions WHERE role_id = $1 AND module_id = $2";
        const values = [roleId, moduleId];
        const result = await this.db.query(query, values);
        return result.rows[0];
    }
  }
  
  module.exports = Permissions;