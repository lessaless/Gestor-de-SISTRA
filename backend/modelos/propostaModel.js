// const mongoose = require("mongoose");
const mongoose = require("../db/connect");
const { getModel } = require("../db/multiDB");
const User = require("./userModel");
const { type } = require("os");

const propostaSchema = mongoose.Schema({

	arquivo_id: {
		type: mongoose.Schema.Types.ObjectId,
	},
	id_proposta: {
		type: String,
		trim: true,
		required: true,
	},
	id_demanda: {
		type: String,
		trim: true,
		required: true,
	},
	id_etpe: {
		type: String,
		trim: true,
	},
	solucao_etpe_escolhida: {
		type: Number,
	},
	id_planinfra: {
		type: String,
		trim: true,
	},
	doc_sigadaer: {
		type: String,
		trim: true,
	},
	data_sigadaer: {
		type: Date,
	},
	status_proposta: {
		type: String,
		trim: true,
	},
	origem_recursos: {
		type: String,
		trim: true,
	},
	ecp_valor: {      //Deve ser usado para caso não exista um ETPE associado
		type: Number,
	},
	ecp_data: {		  //Deve ser usado somente se for cadastrado um ecp_valor
		type: Date,
	},
	inicio_obra_proposta: {		//Aqui o _proposta no final é para diferenciar de um possível inicio_obra de uma entidade futura, tipo projeto
		type: Date,		//Aqui está como no Date, mas no frontend deve ser exibido somente o ano	
	},
	prioridade_ods: {
		type: Number,
	},
	g_gut: {
		type: Number,
	},
	u_gut: {
		type: Number,
	},
	t_gut: {
		type: Number,
	},
	categoria_infraestrutura: {
		type: String,
		trim: true,
	},
	classe_proposta: {
		type: String,
		trim: true,
	},
	atividade_fim_proposta: {
		type: String,
		trim: true,
	},
	plano_diretor_proposta: {
		type: String,
		trim: true,
	},
	pmp_proposta: {
		type: String,
		trim: true,
	},
	repeticao_proposta: { // Quantas vezes a proposta foi repetida
		type: Number,
	},




	obs_proposta: {
		type: String,
		trim: true,
	},
	criado_por: {
		type: String,
		ref: User,
		required: true,
	},
	modificado_por: {
        type: String,
        ref: User,
        required: true,
        default: function () {
            return this.criado_por;
        }
    },
}, {
	timestamps: {
		currentTime: () => new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
		//BRT = UTC-3h00 (- h * min * seg * mseg)
	}/* createdAt e updatedAt automáticos */
}, {
	optimisticConcurrency: true
})

const Proposta = getModel('bibliotecatecnica', "Proposta", propostaSchema, 'propostas')
module.exports = Proposta;