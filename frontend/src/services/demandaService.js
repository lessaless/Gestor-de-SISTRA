import axios from 'axios';

// Definindo a base do url para os endpoints
const apiUrl = process.env.REACT_APP_BACKEND;

const demandaService = {

  async lerPecasDemanda (data) {
    try {
      const response = await axios.get(`${apiUrl}/api/demandas/pecasdemanda`, {params: data});
      return response;
      
    } catch (error) {
      if(error.message === "Network Error") return window.location.href = `${apiUrl}/logout`;
      // Se o erro for de rede, recarrega a página
      console.error("lerDados", error);
      throw new Error(error.response.data.message);
    
    }
  },

  async lerDemandas (data) {
    try {
      const response = await axios.get(`${apiUrl}/api/demandas/buscardemandas`, data);
      console.log("response obtido no lerDemandas do demandaService", response)
      return response;
      
    } catch (error) {
      console.log(error);
      throw new Error(error.response.data.message);
    
    }
  },

  /* Demanda/Projeto */
  async criarDemanda (data) {
    console.log(`Entrei em criarDemanda`)
    console.log("o valor de data é ", data)
    try {
      
      
      const response = await axios.post(`${apiUrl}/api/demandas/criardemanda`, data);  
      console.log("O valor de response é ", response)
      return response;
      
    } catch (error) {
      console.log(error);
      throw new Error(error.response.data.message);
    
    }
  },

  // async obterDemandas() {
  //   try {
  //     const response = await axios.get(`${apiUrl}/api/demandas/obterdemandas`);
  //     return response;

  //   } catch (error) {
  //     console.log(error);
  //     throw new Error(error.response.data.message);

  //   }
  // },

}   

export default demandaService;