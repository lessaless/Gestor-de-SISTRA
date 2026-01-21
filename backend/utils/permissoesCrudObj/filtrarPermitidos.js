// Lista única de campos permitidos para POST e PATCH (excluindo campos gerenciados pelo backend)
const camposPermitidos = [
  // Campos comuns de Gerais
  '_id',
  'id_demanda',
  'id_gerais',
  'arquivo_id',
  'arquivo',
  'titulo_doc',
  'data_doc',
  'doc_sigadaer',
  'data_sigadaer',
  'palavras_chave',
  'obs_gerais',
  'autores',
  'disciplinas',
  'disciplina_principal',
  'displayPessoa',
  'tempo_gasto',
  'nome_militar',
  'disciplinasAutores',

  // Campos específicos de subtipos (discriminators)
  'id_cn',
  'cidade_demanda',
  'ods_objeto',
  'endereco_terreno',
  'fato_originador',
  'om_solicitante',
  'propriedadeFAB',
  'endereco_terreno',
  'tipo',
  'apelido_demanda',
  'titulo_demanda',
  'benfeitoria_bim',
  'solucoes',
  'id_tap',
  'id_status',
  'id_origem_recurso',
  'id_responsavel_recurso',
  'data_estimada_entrega_proj',
  'doc_sigadaer_entrega_proj',
  // ====================== //
  'data_inicio_confecc_doc',
  'data_entrega_doc',
  'periodo_elaboracao',
  // ====================== //
  'id_tmp',
  'id_tep',
  'id_proj',
  'data_alteracao_proj',
  'benfeitoria',
  'localidade_demanda',
  'estado_demanda',
  'fase_do_projeto',
  'apelido_fase_do_projeto',
  'apelido_benfeitoria',
  'apelido_localidade_demanda',
  'codigo_bim',
  'codigo_projeto_bim',
  'codigo_documento_bim',
  'codigo_bim_planinfra',
  'estimativa_de_custo',
  'sequencia_numerica',
  'sequencia_numerica_nnn',

  // ================================== //
  // ============ sistra =============== //
  // ================================== //
  'id_sistra',
  'data_ocorrencia',
  'status_final',
  'tipo_de_acidente',
  'tipo_ocorrencia',
  'dia_da_semana',
  'data_envio_form',
  'natureza_atividade',
  'dispensa_afastamento',
  'agente_causador_acidente',
  'situacao_geradora',
  'parte_do_corpo_atingida',
  'foi_aberto_sindicancia',
  'foi_feito_aso',
  'descricao_gerais',
  'causa_gerais',
  'duracao_dispensa',
  'descricao_dispensa',
  'local_ocorrencia',
  'recomendacoes_csmt',
  'recomendacoes_cipa',
  'acoes_treinamentos',
  'militar_acidentado',
  'gravidade_acidente',




  // ================================== //
  // ========== fim sistra ============ //
  // ================================== //
  //===================================//
  //obs's
  'obs_proj',
  'obs_pei',
  'obs_tmp',
  'obs_tap',
  'obs_tep',
  'obs_ap',
  'obs_cf',
  'obs_cm',
  'obs_de',
  'obs_et',
  'obs_ev',
  'obs_la',
  'obs_ls',
  'obs_ma',
  'obs_mc',
  'obs_md',
  'obs_mdc',
  'obs_mf',
  'obs_mi',
  'obs_mr',
  'obs_ns',
  'obs_nt',
  'obs_od',
  'obs_oes',
  'obs_pb',
  'obs_pg',
  'obs_po',
  'obs_pp',
  'obs_pt',
  'obs_re',
  'obs_rt',
  'obs_ta',
  'obs_te',
  'obs_ten',
  'obs_tj',
  'obs_tm',
  'obs_tr',
  'obs_trd',
  'obs_trp',
  // Fim obs's
  //==================================//
  'autores',
  'data_doc_etpe',
  'valor',
  'elo_resp',
  'origem_recursos',
  'categoria_planinfra',
  'id_planinfra',
  'status_planinfra',
  'status_ppi',
  'progresso',
  'id_etpe'
];
// ` is required.,
// : Path `valor` is required., 
// : Path `elo_resp` is required.,
// : Path `origem_recursos` is required.,
// : Path `categoria_planinfra` is required.
// : Path `id_planinfra` is required., 
// : Path `status_planinfra` is required., 
// : Path `status_ppi` is required., 
// : Path `id_etpe` is required.
const filtrarPermitidos = (objeto) => {
  const resultado = {};
  for (const campo of camposPermitidos) {
    if (objeto[campo] !== undefined) {
      resultado[campo] = objeto[campo];
    }
  }
  return resultado;
}

module.exports = filtrarPermitidos;
