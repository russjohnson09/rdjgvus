module.exports = function(mongo,dbUrl) {
    var self = {};
    var dbUrl = dbUrl
    var mongo = mongo;
    var db;
    
    self.connect = function(callback) {
        if (db) {
            callback(null,db);
        }
        else {
            _connect(mongo,callback);
        }
    }
    
    //get collection
    var getCollection = self.getCollection = function(collectionName,callback) {
        if (!db) {
            _connect(mongo,function(err,d){
                if (err) {
                    callback(err,{});
                }
                else {
                    db = d;
                    callback({},db.collection(collectionName));
                }
            });
        }
        else {
            if (callback) {
                callback({},db.collection(collectionName));
            }
            else {
                return db.collection(collectionName);
            }
        }
    };
    
    function _connect(mongo,callback) {
        mongo.MongoClient.connect(dbUrl, {db : {native_parser: false, server: 
	    {socketOptions: {connectTimeoutMS: 500}}}},callback);
    }
    
    return self;
}
