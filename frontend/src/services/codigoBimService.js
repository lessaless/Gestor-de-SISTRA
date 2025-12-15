import axios from 'axios';

// Definindo a base do url para os endpoints
const apiUrl = process.env.REACT_APP_BACKEND;

const codigoBimService = {

  
  async lerCodigosBim(id_demanda) {
    try {
      const response = await axios.get(`${apiUrl}/api/cns/buscarcns`, {
        params: { id_demanda: id_demanda }
      });
      return response;
    } catch (error) {
      console.log(error);
      throw new Error(error.response.data.message);
    }
  }


}   

export default cnService;