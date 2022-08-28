const fs = require('fs');

const server = require('http').createServer();
server.on('request', (req, res) => {
    // fs.readFile('./big.file', (err, res) => {
    //     if (err) throw err;
    //     res.readInt8(data)
    // })

    const src = fs.createReadStream('./big.file');
    src.pipe(res)
})

server.listen(8000)