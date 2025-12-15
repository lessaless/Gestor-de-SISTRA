const express = require("express");
const router = express.Router();

const { registerUser, logarUsuario, deslogarUsuario, getUser, loginStatus, updateUser, changePassword, forgotPassword, resetPassword, preRegisterUser, verificarPreCadastro} = require("../controladores/userController");
const protect = require("../middleWare/authMiddleware");
//const protectCompetencias = require("../middleWare/authCompetenciasMiddleware");
const loginLimiter = require("../middleWare/limitadorDeLoginMiddleware");

router.post("/preregister", preRegisterUser);
router.get('/verificarprecadastro', verificarPreCadastro)

router.post("/register", registerUser);
router.post("/login", loginLimiter, logarUsuario);
router.get("/logout", deslogarUsuario);
router.get("/getuser", getUser);
router.get("/loggedin", loginStatus);
router.patch("/updateuser", updateUser);
router.patch("/changepassword", changePassword);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resetToken", resetPassword);



module.exports = router;  