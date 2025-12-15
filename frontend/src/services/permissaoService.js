import axios from 'axios';

// Definindo a base do url para os endpoints
const apiUrl = process.env.REACT_APP_BACKEND;

const permissaoService = {


	async alterarPermissao(data) {
		try {
			const response = await axios.patch(`${apiUrl}/api/permissoes/alterar`, data);
			return response;

		} catch (error) {
			throw new Error(error.response.data.message);

		}
	},

	async buscarPermissoes () {
		try {
			const response = await axios.get(`${apiUrl}/api/permissoes/usuarios`);
			return response;

		} catch (error) {
			throw new Error(error.response.data.message);

		}
	},

	async Autorizar () {
		try {
			const response = await axios.get(`${apiUrl}/api/permissoes/autorizar`);
			return response;

		} catch (error) {
			throw new Error(error.response.data.message);

		}
	},


}

export default permissaoService;