const { Server } = require('socket.io')

let io

const users = new Map()

exports.init = (server) => {

    io = require("socket.io")(server, {
        cors: { origin: "*" }
    })

    io.on("connection", (socket) => {
        console.log("Socket Connected :", socket.id)
        socket.on("register", (userid) => {
            users.set(userid, socket.id)
            console.log("User Registered :", userid)
        })

        socket.on("disconnect", () => {
            for (const [userid, socketid] of users.entries()) {
                if (socketid === socket.id) {
                    users.delete(userid)
                    break
                }
            }
            console.log("Socket Disconnected")
        })
    })
}

exports.sendNotification = (userid, data) => {

    const socketid = users.get(userid)

    if (socketid && io) {
        io.to(socketid).emit("notification", data)
    }

}