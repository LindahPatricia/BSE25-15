import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const getUsers = async (req, res) => {
    try {
        const response = await Users.findAll();
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
    }
}

export const getUserById = async (req, res) => {
    try {
        const response = await Users.findOne({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
    }
}

export const Register = async (req, res) => {
    const { name, email, password, confPassword, gender } = req.body;
    let hashPassword = '';
    if (password) {
        if (password !== confPassword) return res.status(400).json({ msg: "Password and Confirm Password do not match" });
        const salt = await bcrypt.genSalt();
        hashPassword = await bcrypt.hash(password, salt);
    } 
    try {
        await Users.create({
            name: name,
            email: email,
            password: hashPassword,
            gender: gender
        });
        res.json({ msg: "Registration Successful" });
    } catch (err) {
        console.log(err);
    }
}


export const updateUser = async (req, res) => {
    try {
        await Users.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        res.status(200).json({ msg: "User Updated" });
    } catch (error) {
        console.log(error.message);
    }
}

export const deleteUser = async (req, res) => {
    try {
        await Users.destroy({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json({ msg: "User Deleted" });
    } catch (error) {
        console.log(error.message);
    }
}

export const Login = async (req, res) => {
    try {
        const user = await Users.findAll({
            where: {
                email: req.body.email
            }
        });
        const match = await bcrypt.compare(req.body.password, user[0].password);
        if (!match) return res.status(400).json({ msg: "Wrong Password" });
        const userId = user[0].id;
        const name = user[0].name;
        const email = user[0].email;
        const gender = user[0].gender;
        const accessToken = jwt.sign({ userId, name, email, gender }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '15s'
        });
        const refreshToken = jwt.sign({ userId, name, email, gender }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '1d'
        });
        await Users.update({ refresh_token: refreshToken }, {
            where: {
                id: userId
            }
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        res.json({ accessToken });
    } catch (err) {
        res.status(404).json({ msg: "Email not found" });
    }
}

export const Logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.sendStatus(204);
        const user = await Users.findAll({
            where: {
                refresh_token: refreshToken
            }
        });
        if (!user[0]) return res.sendStatus(204);
        const userId = user[0].id;
        await Users.update({ refresh_token: null }, {
            where: {
                id: userId
            }
        });
        res.clearCookie('refreshToken');
        return res.sendStatus(200);
    } catch (err) {
        console.log(err)
        res.status(404).json({ msg: err });
    }
}