const db = require('../Models/db');
const Modules = require('../Models/modules')

exports.createModule = async (req, res) => {
    try {
        const { id, module_name, module_url } = req.body;
        const module = await Modules.create({ id, module_name, module_url });
        res.status(200).json({ message: 'module created successfully', module });
      } catch (error) {
        console.error('Error creating module:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
};

exports.getModule = async (req, res) => {
    try {
        const modules = await Modules.findAll(); 
        res.status(200).json(modules); 
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('500 server error');
    }
}

exports.getModuleById = async (req, res) => {
    try {
        const id = req.params.id;
        const module = await Modules.findByPk(id); 
        res.status(200).json(module); 
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('500 server error');
    }
};

exports.updateModule = async (req, res) => {
    try {
        const id = req.params.id;
        const { module_name, module_url } = req.body;
        const module = await Modules.update(req.body, {where: {id: id}});
  
          if (module[0] === 0) {
            return res.status(404).json({ error: 'module not found' });
          }
  
          return res.status(200).json({ success: "module updated sucessfully", module: {id, module_name, module_url} }); 

    } catch (error) {
      console.error('Error updating module:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  exports.deleteModule = (req, res) => {
    try {
        const id = req.params.id;
        const module = Modules.destroy({where: {id: id}})
            if (module[0] === 0) {
                return res.status(404).json({ error: 'module not found' });
            }
            return res.status(200).json({ success: "module deleted successfully" }); 
        
    } catch (error) {
        console.error('Error deleting module:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};