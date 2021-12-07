const { request, gql } = require('graphql-request');
const csv = require('csv-parser')
const fs = require('fs')
const servers = [];

fs.createReadStream('servers.csv')
    .pipe(csv())
    .on('data', (data) => servers.push(data))
    .on('end', () => {
        queryArr = servers.map(createNodeQuery);
        const query = gql`{${queryArr.join()}}`
        request('https://aleochain.io/graphql', query).then((data) => {
            const res = [];
            for (key in data) {

                data[key] && res.push({
                    ...data[key],
                })
            }
            console.table(res.sort((a, b) => b.latest_cumulative_weight - a.latest_cumulative_weight))
        })
    });

const createNodeQuery = (server, index) => `
    node${index}: node(ip: "${server['IP']}"){
        ip
        block_height
        node_status
        latest_cumulative_weight
        company
        country
    }`
