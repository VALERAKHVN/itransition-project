const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.test = (req, res) => {
    // Save User to Database
    res.send({ message: "tested successfully!" });
    // User.create({
    //     username: req.body.username,
    //     email: req.body.email,
    //     password: bcrypt.hashSync(req.body.password, 8)
    // })
    //     .then(user => {
    //         res.send({ message: "User was registered successfully!" });
    //     })
    //     .catch(err => {
    //         res.status(500).send({ message: err.message });
    //     });
};

exports.signup = async (req, res) => {
    // Save User to Database
    let lastUserId = 1;
    // res.send({ message: JSON.stringify(req.body) });
    // return;
    await User.findOne({
        limit: 1,
        order: [ [ 'id', 'DESC' ]],
    }).then(lastUser => {
        if(lastUser){
            lastUserId = lastUser.id + 1;
            User.create({
                id: lastUserId,
                name: req.body.userName,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, 8)
            })
                .then(user => {
                    res.send({ message: "User was registered successfully!" });
                })
                .catch(err => {
                    res.status(500).send({ message: err.message });
                });
        }
    })
};

exports.signin = (req, res) => {
    User.findOne({
        where: {
            name: req.body.userName
        }
    })
        .then(user => {
            if (!user) {
                return res.status(404).send({ message: "User Not found." });
            }

            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid Password!"
                });
            }

            const token = jwt.sign({ id: user.id },
                config.secret,
                {
                    algorithm: 'HS256',
                    allowInsecureKeySizes: true,
                    expiresIn: 86400, // 24 hours
                });

            res.status(200).send({
                id: user.id,
                username: user.name,
                email: user.email,
                accessToken: token
            });
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
};

