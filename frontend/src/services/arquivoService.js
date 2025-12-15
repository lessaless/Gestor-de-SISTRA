import axios from 'axios';

// Definindo a base do url para os endpoints
const apiUrl = process.env.REACT_APP_BACKEND;

const arquivoService = {

  async carregarArquivo (data) {

    try {
      const response = await axios.post(`${apiUrl}/api/arquivo/upload`, {...data}, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
      
    } catch (error) {
      console.error(error);
      throw new Error(error.response.data.message);
          
    }
  },

  async buscarArquivo (id) {
    try {
      const response = await axios.get(`${apiUrl}/api/arquivo/buscar/${id}`);
      return response;
      
    } catch (error) {
      console.error(error);
      throw new Error(error.response.data.message);
          
    }
  }

}   

export default arquivoService;