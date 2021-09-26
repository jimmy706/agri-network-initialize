const mongoose = require('mongoose');
require('dotenv').config();
const UserModel = require('./models/User');
const FollowModel = require('./models/Follow');
const PostTagModel = require('./models/PostTag');
const FriendModel = require('./models/Friend');

const neo4j = require('neo4j-driver');
const neo4jQuery = require('./neo4j-query');
const provincesJson = require('./data/provinces.json');
const tagsJson = require('./data/tags.json');

const { MONGO_USER, MONGO_PASSWORD, MONGO_HOST, MONGO_PORT, MONGO_DB_NAME } = process.env;

const { NEO4J_USER, NEO4J_PASSWORD, NEO4J_HOST, NEO4J_PORT, NEO4J_DB_NAME } = process.env;


const driver = neo4j.driver(`bolt://${NEO4J_HOST || 'localhost'}:${NEO4J_PORT || '7687'}`, neo4j.auth.basic(NEO4J_USER || 'neo4j', NEO4J_PASSWORD || 'b1709272'));


async function runNeo4jQuery(query, params = {}) {
    const session = driver.session({ database: NEO4J_DB_NAME });

    const result = await session.run(query, params);
    session.close();
    return result;
}

async function createNeo4jTransaction(query, params = {}) {
    const session = driver.session({ database: NEO4J_DB_NAME });

    const result = await session.writeTransaction((transaction) => {
        return transaction.run(query, params);
    });
    const singleRecord = result.records[0];
    session.close();
    return singleRecord;

}

async function importUsers() {
    const users = await UserModel.find({});

    const queryCreateProvinces = [];
    const provinces = JSON.parse(JSON.stringify(provincesJson));

    for (let key in provinces) {
        const province = provinces[key];
        queryCreateProvinces.push(`MERGE (p${key}:Province {name: '${province.name}'})`);
    }

    await runNeo4jQuery(queryCreateProvinces.join('\n'));


    const queryCreateUsers = [];
    for (let user of users) {
        const queryStr = ` 
        MATCH (p:Province{name: $province}) 
        MERGE (u:User {name: $name, email: $email, uid: $uid})
        CREATE (u)-[:LIVED_IN]->(p)`;

        const { firstName, lastName, email, province, } = user;
        const queryParams = {
            name: `${firstName} ${lastName}`,
            email,
            province,
            uid: user._id.toString()
        };
        queryCreateUsers.push({ queryStr, queryParams });
    }
    await Promise.all(queryCreateUsers.map(query => {

        return runNeo4jQuery(query.queryStr, query.queryParams);
    }));
}

async function importFriendRelationship() {
    const friendEntities = await FriendModel.find({});
    const importFriendRelationshipRequests = [];

    for (let friendEntity of friendEntities) {
        const { friends } = friendEntity;

        if (friends.length > 0) {
            friends.forEach(f => {
                const queryStr = `
            MATCH (u1:User {uid: $uid1})
            MATCH (u2:User {uid: $uid2})
            MERGE (u1)-[:FRIENDED]->(u2)`;
                const queryParams = {
                    uid1: friendEntity.owner,
                    uid2: f.toString()
                }
                importFriendRelationshipRequests.push({ queryStr, queryParams });
            });
        }
    }

    await Promise.all(importFriendRelationshipRequests.map(request => {
        return runNeo4jQuery(request.queryStr, request.queryParams)
    }));
}

async function importFollowRelationship() {
    const follows = await FollowModel.find({})
    let followingRequests = [];

    for (let follow of follows) {
        const followings = follow.followings;

        if (followings.length > 0) {
            followings.forEach(following => {
                const queryStr = `
                    MATCH (u1:User {uid: $uid1})
                    MATCH (u2:User {uid: $uid2})
                    MERGE (u1)-[:FOLLOWED]->(u2)
                `;
                const queryParams = {
                    uid1: follow.owner,
                    uid2: following.toString()
                }
                followingRequests.push({ queryStr, queryParams });
            });
        }
    }

    await Promise.all(followingRequests.map(request => {
        return runNeo4jQuery(request.queryStr, request.queryParams)
    }));

}

async function importTags() {
    const tags = JSON.parse(JSON.stringify(tagsJson));

    await PostTagModel.deleteMany({});

    for (let tag of tags) {
        const newTag = new PostTagModel({ name: tag });
        await newTag.save();
    }
}

mongoose.connect(`mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB_NAME}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(async () => {
        console.log('Connected to mongodb');
        await runNeo4jQuery(neo4jQuery.DELETE_ALL);
        await importUsers();
        await importFriendRelationship();
        await importFollowRelationship();
        await importTags();
        mongoose.disconnect();
        driver.close();
    })
    .catch(error => {
        console.log(error);
    })

