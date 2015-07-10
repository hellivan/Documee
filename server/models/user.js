module.exports = function(mongoose){
    var Schema = mongoose.Schema;

    var userSchema = new Schema({
        username : {type: String, required: true, unique: true, index: true},
        password : {type: String, required: true, index:true},
        first_name: {type: String},
        last_name: {type: String},
        email: { type: String}
    });

    userSchema.pre('save', function(next) {
        console.log("Executing pre-save!");
        if (this.isNew) {
            console.log("pre-save: Creating new user!");
        }
        next();
    });


    return mongoose.model('User', userSchema);
};



