module.exports = function(mongoose){
    var Schema = mongoose.Schema;

    var consumerSchema = new Schema({
        company_name: {type: String, required: true},
        email: { type: String, required: true, unique: true, index: true},
        api_key: { type: String, required: true, unique: true, index: true},
        created_at: Date,
        project: {
            name: String,
            description: String,
            url: String
        },
        authorized: {type: Boolean, required: true}
    });

    consumerSchema.pre('save', function(next) {
        console.log("Executing pre-save!");
        if (this.isNew) {
            console.log("pre-save: Creating new customer!");
        }
        next();
    });


    return mongoose.model('Consumer', consumerSchema);
};



