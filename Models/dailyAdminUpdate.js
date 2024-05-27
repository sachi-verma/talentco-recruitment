const {sequelize} = require('./db');
const {DataTypes} = require('sequelize');

const AdminUpdate = sequelize.define('AdminUpdate',{
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    // candidate_id: {
    //     type: DataTypes.INTEGER,
    //     allowNull: false,
    //     references: {
    //         model: 'allCandidates',
    //         key: 'id',
    //     }
    // },
    cv_sent_count: {
        type: DataTypes.STRING,
    },
    update_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    created_by: {
        type: DataTypes.STRING,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_by: {
        type: DataTypes.STRING,
    }
},
{
    tableName: 'daily_admin_update',
})


module.exports = AdminUpdate
