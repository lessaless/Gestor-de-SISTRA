import axios from 'axios';

// Definindo a base do url para os endpoints
const apiUrl = process.env.REACT_APP_BACKEND;

const adminService = {


  async verificarAdmin() {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/verificar`);
      return response;

    } catch (error) {
      if (error.respons.status !== 403) {
        console.error(error);
        throw error;
      }

    }
  },

  async verLogs() {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/logs`);
      return response;

    } catch (error) {
      console.error(error);
      throw error;

    }
  },

  async verArquivo(filename) {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/logs/${filename}`, {
        responseType: 'text' // Garante que o Axios trate a resposta como texto
      });
      return response;

    } catch (error) {
      console.error(error);
      throw error;

    }
  },


  async verPreCadastros() {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/precadastros`);
      return response;

    } catch (error) {
      console.error(error);
      throw error;

    }
  },

  async aprovarPreCadastro(data) {
    try {
      const response = await axios.post(`${apiUrl}/api/admin/aprovarprecadastro`, {...data});
      return response;

    } catch (error) {
      console.error(error);
      throw error;

    }
  },

  async removerPreCadastro(data) {
    try {
      
      const response = await axios.delete(`${apiUrl}/api/admin/removerprecadastro`, {params: data});
      return response;

    } catch (error) {
      console.error(error);
      throw error;

    }
  }

}

export default adminService;