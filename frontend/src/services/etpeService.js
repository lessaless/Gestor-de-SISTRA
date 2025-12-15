import axios from 'axios';

// Definindo a base do url para os endpoints
const apiUrl = process.env.REACT_APP_BACKEND;

const etpeService = {

  
  async lerETPEs(id_demanda) {
    try {
      const response = await axios.get(`${apiUrl}/api/etpes/buscaretpes`, {
        params: { id_demanda: id_demanda ? id_demanda : undefined }
      });
      console.log("dados da função lerETPEs do service", id_demanda);
      return response;
    } catch (error) {
      console.log(error);
      throw new Error(error.response.data.message);
    }
  },

  async buscarSolucoesPorETPE(id_etpe) {
    try {
      console.log("id_etpe que chegou no service buscarSolucoesPorETPE", id_etpe)
      const response = await axios.get(`${apiUrl}/api/etpes/buscarsolucoes`, {
        params: { id_etpe: id_etpe ? id_etpe : undefined }
      });
      console.log("dados da função buscarSolucoesPorETPE do service", response.data);
      return response.data;
    } catch (error) {
      console.log(error);
      throw new Error(error.response.data.message);
    }
  },




}   

export default etpeService;