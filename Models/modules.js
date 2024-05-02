class Module {
    constructor(db) {
      this.db = db
    }
  
    async getModuleById(moduleId) {
      const query = "SELECT * FROM modules WHERE module_id = $1";
      const values = [moduleId];
      const result = await this.db.query(query, values);
      return result.rows[0];
    }
  
    async getModules() {
      const query = "SELECT * FROM modules";
      const result = await this.db.query(query);
      return result.rows;
    }
  }
  
  module.exports = Module;