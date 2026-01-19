import axios from 'axios';
import { toast } from 'react-toastify';

// Definindo a base do url para os endpoints
const apiUrl = process.env.REACT_APP_BACKEND;

const crudService = {


  async lerDados(data) {
    try {
      const response = await axios.get(`${apiUrl}/api/crud/ler`, { params: data });
      console.log("Valor de response é", response)
      return response;

    } catch (error) {
      console.error("lerDados error:", error.response?.data || error.message);
      // if(error.message === "Network Error") return window.location.href = `${apiUrl}/logout`;
      if (error.message === "Network Error") {
        return window.location.reload();
        // Se o erro for de rede, recarrega a página
      }
      throw new Error(error.response.data.message);

    }
  },

  async criarDados(data) {
    console.log("Valor de data é", data)

    const toastId = toast.loading("Salvando...");
    try {
      const response = await axios.post(`${apiUrl}/api/crud/criar`, { ...data });
      console.log("Valor de response é", response)
      toast.dismiss(toastId);
      return response;

    } catch (error) {
      console.error(error);
      toast.dismiss(toastId);
      throw new Error(error.response.data.message);

    }
  },

  // async atualizarDados(data) {
  //   const toastId = toast.loading("Salvando...");
  //   try {
  //     // console.log("entrou no crudSerice atualizarDados")
  //     console.log('Valor de data:', data);


  //     const response = await axios.patch(`${apiUrl}/api/crud/atualizar`, data);
  //     console.log('Valor de response:', response);
  //     console.log(`Valor de response: ${response}`)
  //     toast.dismiss(toastId);
  //     return response;

  //   } catch (error) {
  //     console.error(error);
  //     toast.dismiss(toastId);
  //     throw new Error(error.response.data.message);

  //   }
  // },


  async atualizarDados(data) {
    const toastId = toast.loading("Salvando...");
    try {
      // console.log('Valor de data:', JSON.stringify(data, null, 2));
      // console.log('Valor de apiUrl:', JSON.stringify(apiUrl, null, 2));
      const response = await axios.patch(`${apiUrl}/api/crud/atualizar`, data);
      console.log('Valor de response:', response); // plain log, not template
      toast.dismiss(toastId);
      return response;

    } catch (error) {
      toast.dismiss(toastId);

      // Robust diagnostics:
      const status = error?.response?.status;
      const respData = error?.response?.data;
      const reqData = error?.config?.data; // what was sent (stringified)

      console.error('PATCH FAILED', { status, respData, reqData });
      console.log("Valor de reqData é ", reqData)
      console.log("Valor de respData é", respData)
      // show server message if present, else generic
      const msg = respData?.message || error.message || 'Erro ao atualizar';
      throw new Error(msg);
    }
  },

  async deletarDados(data) {
    const toastId = toast.loading("Deletando...");
    try {
      const response = await axios.delete(`${apiUrl}/api/crud/deletar`, { params: data });
      toast.dismiss(toastId);
      return response;

    } catch (error) {
      console.error(error);
      toast.dismiss(toastId);
      throw new Error(error.response.data.message);

    }
  },

}

export default crudService;