import axios from 'axios';

// Definindo a base do url para os endpoints
const apiUrl = process.env.REACT_APP_BACKEND;

// Definindo objeto do serviço
const authReport = {



	//REGISTRAR REPORT DE BUG
	async adicionarReport(data) {
		let endpoint = `${apiUrl}/api/reports/addreport`;
		try {
			const response = axios.post(endpoint, {
				...data,
				config: { withCredentials: true },
			});
			return response;

		} catch (error) {
			console.log(error)
			return error;
		}
	},

	async lerReports() {
		let endpoint = `${apiUrl}/api/reports/lerreports`;
		try {
			const response = await axios.get(endpoint);
			return response;

		} catch (error) {
			throw error;
		}
	},

	async atualizarReport(id, data) {
		let endpoint = `${apiUrl}/api/reports/atualizarreports`;
		const response = await axios.patch(endpoint, { id, ...data }, { withCredentials: true });
		return response;
	},


	async enviarEmail({ destinatario, assunto, mensagem }) {
		let endpoint = `${apiUrl}/api/reports/enviaremailreport`;
		try {
			const response = await axios.post(endpoint, {
				destinatario,
				assunto,
				mensagem
			}, { withCredentials: true });
			return response;
		} catch (error) {
			throw error;
		}
	}

}

export default authReport;