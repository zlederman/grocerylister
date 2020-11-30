const mongoose = require("mongoose");
const schema = mongoose.Schema;

let groceryList = new schema(
    {
        items:[{
            type: String
        }],
        date:{
            type: String
        }
    },{collection : "grocerylists"}
);
module.exports = mongoose.model("grocerylist", groceryList);