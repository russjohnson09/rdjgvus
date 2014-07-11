(function(){Ar = new Meteor.Collection("ar");
Customer = new Meteor.Collection("customer");


if (Meteor.isClient) {
  Template.main.events({
    'click #addcharge': function () {
        var name = document.getElementById("customer").value;
        if (!name) {
            console.log("name is a required field");
            return;
        }
        var customer = Customer.findOne({name:name});
        var cid,amount;
        if (customer) {
            cid = customer._id;
        }
        else {
            cid = Customer.insert({name:name});
        }
        var amount = parseFloat(document.getElementById("amount").value);
        var charge = Ar.insert({amount:amount,customer:cid});
        console.log("Successfully added charge of " + amount + " for customer " + name);
    },
    'click #clear' : clearClient 
  });
  
  Template.chargetable.customername = function(cid) {
    //return cid;
    var customer = Customer.findOne({_id:cid});
    console.log(customer);
    if (customer) {
        return customer.name;
    }
    return "";
  };
  
  Template.chargetable.charges = function() {
    return Ar.find({});
  };
  
  Template.chargetable.total = function() {
    var result = 0;
    Ar.find({}).forEach(function(doc) {
        result +=doc.amount;
    });
    return result;
  };
  
  Template.main.customers = Template.customerlist.customers = Template.datalists.customers = 
  Template.customertable.customers =
  function() {
    return Customer.find({});
  }
  
  Template.customerlist.amount = Template.customertable.amount =
    function(cid) {
        var result = 0;
        Ar.find({customer:cid}).forEach(function(doc) {
            result += doc.amount
        });
        return result;
    }
  
  Template.customerlist.helpers({
    amount: function(cid) {
        var result = 0;
        Ar.find({customer:cid}).forEach(function(doc) {
            result += doc.amount
        });
        return result;
    }
  });
  
  Template.datalists.helpers({
  });
  
  Meteor.startup(function () {
    Meteor.subscribe("ar");
    Meteor.subscribe("customer");
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    //clear();
    if (Customer.find({}).count() == 0) {
        //clear();
        //add();
    }
    
    Meteor.publish("ar", function() {
        return Ar.find({});
    });

    Meteor.publish("customer", function() {
        return Customer.find({});
    });
    
    Ar.allow({
        insert: function() {
            return true;
        },
        update: function() {
            return true;
        },
        remove: function() {
            return true;
        }
    });
    Customer.allow({
        insert: function() {
            return true;
        },
        update: function() {
            return true;
        },
        remove: function() {
            return true;
        }
    });
  });
}

  
  
function add() {
    Ar.insert({customer:'Mark',amount:1000,type:'charge',product:'cpu',quantity: 10});
    Ar.insert({customer:'Mark',amount:-1000,type:'payment',paydate:''});
}

function clear() {
    Ar.remove({});
    Customer.remove({});
}

function clearClient() {
    Ar.find({}).forEach(function(doc) {
        Ar.remove({_id:doc._id});
    });
    Customer.find({}).forEach(function(doc) {
        Customer.remove({_id:doc._id});
    });
}

})();
