const { Category, Material } = require('../models');

class CategoryController {
  // GET /api/categorias
  async getAll(req, res) {
    try {
      const categories = await Category.findAll({
        where: { parent_id: null },
        include: [
          {
            model: Category,
            as: 'subcategories',
            include: [{ model: Material, as: 'materials', attributes: ['id', 'name', 'internal_code'] }]
          },
          { model: Material, as: 'materials', attributes: ['id', 'name', 'internal_code'] }
        ],
        order: [['code', 'ASC']]
      });

      return res.json({ success: true, count: categories.length, data: categories });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/categorias
  async create(req, res) {
    try {
      const { code, name, description, parent_id } = req.body;
      if (!code || !name) {
        return res.status(400).json({ success: false, message: 'code y name son obligatorios.' });
      }

      const newCat = await Category.create({ code, name, description, parent_id: parent_id || null });
      return res.status(201).json({ success: true, data: newCat });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new CategoryController();

