import axios from 'axios';
import { toast } from "react-toastify";

// Definindo a base do url para os endpoints
const apiUrl = process.env.REACT_APP_BACKEND;

// Definindo o bjeto do serviço
const userService = {


    //PRÉ-REGISTRAR USUÁRIO
    async preRegister(data) {
        
        let endpoint = `${apiUrl}/api/preusers/preregister`;
        try {
            const response = await axios.post(endpoint, { ...data });
            return response;

        } catch (error) {
            throw new Error(error.response.data.message);
        }
    },

    async verificarPreCadastro(data) {
        try {

            const response = await axios.get(`${apiUrl}/api/preusers/verificarprecadastro`, { params: data });
            return response;

        } catch (error) {
            console.error(error);
            throw error;

        }
    },

    //REGISTRAR USUÁRIO
    async authenticateRegister(data) {
        let endpoint = `${apiUrl}/api/users/register`;
        const response = axios.post(endpoint, { ...data });
        return response;
    },

    //LOGAR USUÁRIO
    async authenticateLogin(data) {
        let endpoint = `${apiUrl}/api/users/login`;
        const response = axios.post(endpoint, { ...data });
        return response;
    },

    //MANDAR EMAIL RECUPERAÇÃO DE SENHA
    async authenticatePassword(data) {
        let endpoint = `${apiUrl}/api/users/forgotpassword`;
        const response = axios.post(endpoint, { ...data });
        return response;
    },

    async resetPassword(data, resetToken) {
        let endpoint = `${apiUrl}/api/users/resetpassword/${resetToken}`;
        const response = axios.put(endpoint, { ...data });
        return response;
    },

    // Função para salvar o usuário logado no local storage
    //localStorage para não limpar os dados quando recarregar o navegador/página
    //sessionStorage limpa
    setLoggedUser(data, manterOn) {
        let parsedData = JSON.stringify(data);
        delete data.Permissoes;
        if (manterOn === true) {
            localStorage.setItem("user", parsedData);
        } else sessionStorage.setItem("user", parsedData);
    },

    // Função responsável por recuperar o usuário logado do storage
    getLoggedUser() {
        let data = sessionStorage.getItem("user") || localStorage.getItem("user");
        //console.log("logado? ", data);
        if (!data) return null;
        try {
            let parsedData = JSON.parse(data);
            return parsedData;
        } catch (error) {
            console.log(error);
            return null;
        }
    },

    async cleanLoggedUser() {
        localStorage.clear();
        sessionStorage.clear();

        try {
            //usa o endpoint do Autenticador/Portal pois lá desloga todos os sistemas
            //console.log("entrou no cleanLoeggeduser")
            let endpoint = `${process.env.REACT_APP_BACKEND}/api/users/logout`;
            const resp = await axios.get(endpoint);
            let message = resp.data?.message || resp.message;
            return message;
        } catch (error) {
            toast.error(error);
        }
    },

    //Verifica se o usuário está logado
    async verificaLogin() {
        let endpoint = `${apiUrl}/api/users/loggedin`;
        const response = await axios.get(endpoint);
        return response;
    },
}

export default userService;