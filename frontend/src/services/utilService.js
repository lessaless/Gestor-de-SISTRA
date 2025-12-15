import axios from 'axios';
// import { obterAps } from '../../../backend/controladores/utilController';
//import { obterFasesDoProjeto } from '../../../backend/controladores/utilController';

// Definindo a base do url para os endpoints
const apiUrl = process.env.REACT_APP_BACKEND;

const utilService = {
	// ============================= //
	// início documentos SISTRA
	// ============================= //
	async obterAgenteCausadorAcidentes(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obteragentecausadoracidentes`, { params: data });
			console.log("valor de response é", response)
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterHouveDispensaOuAfastamentos(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obterhouvedispensaouafastamentos`, { params: data });
			console.log("valor de response é", response)
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterNaturezaDaAtividades(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obternaturezadaatividades`, { params: data });
			console.log("valor de response é", response)
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterTipoDeAcidentes(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obtertipodeacidentes`, { params: data });
			console.log("valor de response é", response)
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterStatusFinals(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obterstatusfinals`, { params: data });
			console.log("valor de response é", response)
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterSituacaoGeradoras(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obtersituacaogeradoras`, { params: data });
			console.log("valor de response é", response)
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},

	async obterParteDoCorpoAtingidas(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obterpartedocorpoatingidas`, { params: data });
			console.log("valor de response é", response)
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	// ============================= //
	// Fim documentos SISTRA
	// ============================= //

	async obterOMs(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obteroms`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);

		}
	},

	async obterODS(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obterods`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);

		}
	},

	async obterEstados(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obterestados`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);

		}
	},

	async obterMunicipios(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obtermunicipios`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},

	async obterEfetivo(data) {

		try {
			const response = await axios.get(`${apiUrl}/api/utils/obterefetivo`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},

	async obterTerrenos(data) {
		try {
			//console.log("Entrou no obterTerrenos do service")
			const response = await axios.get(`${apiUrl}/api/utils/obterterrenos`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},

	async obterBenfeitorias(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obterbenfeitorias`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterBenfeitoriasBim(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obterbenfeitoriasbim`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterCodigosBim(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obtercodigosbim`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterPlaninfras(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obterplaninfras`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterLocalidades(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obterlocalidades`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterUfs(data) {
		try {
			//console.log("Entrou no obterTerrenos do service")
			const response = await axios.get(`${apiUrl}/api/utils/obterterrenos`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},

	async obterFasesDoProjeto(data) {
		try {
			//console.log("Entrou no obterfasesdoprojeto do service")
			const response = await axios.get(`${apiUrl}/api/utils/obterfasesdoprojeto`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},


	async obterStatus(data) {
		try {
			//console.log("Entrou no obterStatus do utilService")
			const response = await axios.get(`${apiUrl}/api/utils/obterstatus`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterRecurso(data) {
		try {
			//console.log("Entrou no obterrecurso do utilservice")
			const response = await axios.get(`${apiUrl}/api/utils/obterrecurso`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterDisciplinas(data) {
		try {
			//console.log("Entrou no obterrecurso do utilservice")
			const response = await axios.get(`${apiUrl}/api/utils/obterdisciplinas`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},

	// ============================= //
	// Início documentos PEI
	// ============================= //
	async obterAps(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obteraps`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterCfs(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obtercfs`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterCms(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obtercms`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterEts(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obterets`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterEvs(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obterevs`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterLas(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obterlas`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterLss(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obterlss`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterMas(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obtermas`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterMcs(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obtermcs`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterMds(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obtermds`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterMdcs(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obtermdcs`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterMfs(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obtermfs`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterMis(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obtermis`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterMrs(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obtermrs`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterNss(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obternss`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterNts(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obternts`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterOds(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obterods`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterPbs(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obterpbs`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterPgs(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obterpgs`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterPos(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obterpos`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterPps(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obterpps`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterPts(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obterpts`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterRes(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obterres`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterRts(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obterrts`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterTas(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obtertas`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterTes(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obtertos`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterTjs(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obtertjs`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterTms(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obtertms`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	async obterTrs(data) {
		try {
			const response = await axios.get(`${apiUrl}/api/utils/obtertrs`, { params: data });
			return response;

		} catch (error) {
			console.error(error);
			throw new Error(error.response.data.message);
		}
	},
	// ============================= //
	// Fim documentos PEI
	// ============================= //


}

export default utilService;