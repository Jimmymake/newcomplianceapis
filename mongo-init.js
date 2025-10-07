// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

db = db.getSiblingDB('merchantdb');

// Create collections with proper indexes
db.createCollection('users');
db.createCollection('companies');
db.createCollection('uboinfos');
db.createCollection('paymentinfors');
db.createCollection('settlementbankdetails');
db.createCollection('complianceriskmanagements');
db.createCollection('kycdocs');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "merchantid": 1 }, { unique: true });
db.users.createIndex({ "phonenumber": 1 });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "onboardingStatus": 1 });
db.users.createIndex({ "createdAt": 1 });

db.companies.createIndex({ "merchantid": 1 }, { unique: true });
db.uboinfos.createIndex({ "merchantid": 1 }, { unique: true });
db.paymentinfors.createIndex({ "merchantid": 1 }, { unique: true });
db.settlementbankdetails.createIndex({ "merchantid": 1 }, { unique: true });
db.complianceriskmanagements.createIndex({ "merchantid": 1 }, { unique: true });
db.kycdocs.createIndex({ "merchantid": 1 }, { unique: true });

print('Database initialized with collections and indexes');



