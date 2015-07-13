module.exports = function(mongoose){
    var Schema = mongoose.Schema;

    var providerSchema = new Schema({
        provider_name: {type: String, required: true},
        oauth : {
            client_id: String,
            client_secret: String,
        },
        active: {type: Boolean, required: true}
    });



    return mongoose.model('Providers', providerSchema);
};



