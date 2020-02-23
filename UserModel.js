var mongoose = require('mongoose');
var shortId = require('shortid');

var userSchema = new mongoose.Schema({ 
    _id: { 
        type : String , 
        default : shortId.generate
    },
    username: { 
        type : String , 
        unique : true, 
        required : true, 
        dropDups: true 
    }, 
    log: [{
        type: mongoose.Schema.Types.String, 
        ref: 'Exercises' 
    }]
});

module.exports =  mongoose.model('Users', userSchema); 