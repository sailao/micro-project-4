var mongoose = require('mongoose');
var shortId = require('shortid');

var exerciseSchema = new mongoose.Schema({ 
    _id: { 
        type : String , 
        default : shortId.generate
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    userId: { 
        type : String , required : true
    },
    description: { 
        type : String , required : true
    },
    duration: { 
        type : Number , required : true
    },
    date: { 
        type : Date , required : true
    }
});

module.exports =  mongoose.model('Exercises', exerciseSchema)