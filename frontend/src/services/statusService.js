import axios from 'axios';

// Definindo a base do url para os endpoints
const apiUrl = process.env.REACT_APP_BACKEND;

const statusService = {

  
  async lerStatus(id_status) {
    try {
      const response = await axios.get(`${apiUrl}/api/status/buscarstatus`, {
        params: { id_status: id_status }
      });
      return response;
    } catch (error) {
      console.log(error);
      throw new Error(error.response.data.message);
    }
  }


}   

export default statusService;