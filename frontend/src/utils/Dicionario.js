const traducoes = {
    // Geral
    "_id": "ID Banco de Dados",
    "id_demanda": "ID Demanda",
    "id_cn": "ID CN",
    "createdAt": "Data do Cadastro",
    "updatedAt": "Última Modificação",
    "criado_por": "Autor do Cadastro",
    "modificado_por": "Autor da última modificação",
    "data_doc": "Data do Documento",
    
    // Arquivo
    "caminho": "Endereço do Arquivo",
    "downloads": "Downloads",
    "titulo_arquivo": "Nome do Arquivo",
    "visualizacoes": "Visualizações",

    // CN/Demanda
    "om_solicitante": "OM Solicitante",
    "titulo_demanda": "Título",
    "apelido_demanda": "Epíteto",//"Apelido",
    "apelido_localidade_demanda": "Localidade",
    "apelido_benfeitoria": "Benfeitoria",
    "benfeitoria_bim": "Tipo Benfeitoria Bim",
    "localidade_demanda": "Tipo Localidade Bim",
    "doc_sigadaer": "Documento relacionado",
    "data_sigadaer": "Data do documento relacionado",
    // ======================================================= //
    "data_inicio_confecc_doc": "Início da Confecção do Documento",
    "data_entrega_doc": "Entrega do Documento",
    "periodo_elaboracao": "Período de Elaboração do Documento (dias)",
    // ======================================================= //
    "ods_demanda": "ODS",
    "obs_pei": "Observações",
    "estado_demanda": "Estado",
    "cidade_demanda": "Cidade",
    "obs_demanda": "Observações",
    "status": "Status",
    "progresso":"Progresso do Projeto",
    "tipo_doc": "Tipo do Documento",
    "propriedadeFAB": "Propriedade da FAB",
    "data_doc_cn": "Data do CN",
    "data_doc_etpe": "Data do ETPE",
    "status_cn": "Status do Caderno de Necessidades",
    "elo_cadastro": "Elo Cadastro",
    "tipo": "Tipo",
    "terreno": "Terreno",
    "endereco_terreno": "Endereço",
    "benfeitoria": "Benfeitoria",
    "om_objeto": "OM do Objeto",
    "fato_originador": "Fato Originador",
    "detalhe_fato_originador": "Detalhes do Fato Originador",
    "detalhes_despacho": "Detalhes do Despacho Pessoal",
    "outro_fato_originador": 'Especificação do Fato Originador marcado como "Outro"',
    "data_fato_originador": "Data do Fato Originador",
    "ods_objeto": "ODS do Objeto",
    "obs_cn": "Observações",
    
    //ETPE
    "id_etpe": "ID ETPE",
    "obs_etpe": "Observações",
    "autores": "Autores",
    "solucoes": "Soluções",
    "elo_resp": "Elo responsável",
    //ETPE > solucoes
    "nume_solucao": "Número da solução",
    "valor_solucao": "Valor da solução",
    "tempo_projeto_solucao": "Tempo de projeto (meses)",
    "tempo_obra_solucao": "Tempo de obra (meses)",
    //ETPE > autores
    "tempo_gasto": "Horas empregadas",
    "nome_militar":"Autor",
    //GERAIS
    "titulo_doc": "Título ou assunto do documento",
    "obs_gerais": "Observações",
    "expireAt": "Expira em",

    //Proposta
    "inicio_obra_proposta": "Início Previsto da Obra",
    "ecp_valor": "ECP (R$)",
    "ecp_data": "Data ECP",
    "origem_recursos": "Origem dos Recursos",
    "id_planinfra": "ID PLANINFRA",
    "id_proposta": "ID Proposta",
    "status_proposta": "Status Proposta",
    "prioridade_ods": "Prioridade ODS",
    "obs_proposta": "Observações",
    "g_gut": "G - GUT",
    "u_gut": "U - GUT",
    "t_gut": "T - GUT",
    "categoria_infraestrutura": "Categoria de Infraestrutura",
    "classe_proposta": "Classe Proposta",
    "pmp_proposta": "PMP Proposta",
    "repeticao_proposta": "Repetição Proposta",
    "atividade_fim_proposta": "Atende à Atividade-fim",
    "plano_diretor_proposta": "Plano Diretor",
    "solucao_etpe_escolhida": "Solução ETPE escolhida",
    
    //subModelos Gerais
    "id_gerais": "Identificador",
    "__t": "Tipo de documento",
    "palavras_chave": "Palavras-chave",
    "disciplinas": "Disciplinas",
    "om_autora": "OM autora do documento",

    // SISTRA
    "data_ocorrencia":"Data da Ocorrência",
    "agente_causador_acidente":"Agente Causador do Acidente",
    "situacao_geradora":"Situação Geradora",
    "parte_do_corpo_atingida":"Parte do Corpo Atingida",
    "data_envio_form":"Data de Envio da Ocorrência",
    "natureza_atividade":"Natureza da Atividade",
    "dispensa_afastamento":"Dispensa Afastamento",
    "agente_causador":"Agente Causador",
    "situacao_geradora":"Situação Geradora",
    "parte_do_corpo_atingida":"Parte do Corpo Atingida",
    "periodo_elaboracao":"Período de Elaboração",
    // campos textuais - sistra
    "descricao_gerais":"Descrição Gerais",
    "causa_gerais":"Causa da Ocorrência",
    "descricao_dispensa":"Descrição Dispensa",
    "local_ocorrencia":"Local Ocorrência",
    "recomendacoes_csmt":"Recomendações CSMT",
    "recomendacoes_cipa":"Recomendações CIPA", 
    "acoes_treinamentos":"Ações e treinamentos",
    
    //Nomes de subModelos de Documentos (__t)
    // DEVEM SER EXATAMENTE IGUAIS AOS NOMES DOS COMPONENTES DO ARQUIVO frontend/src/utils/ColecaoModelo.js
    "CadernoDeNecessidades": "Caderno de Necessidades",
    "EstudoTecnicoPreliminarDeEngenharia": "Estudo Técnico Preliminar de Engenharia",
    "LaudoTecnico": "Laudo Técnico",
    "NotaTecnica": "Nota Técnica",
    "OrdemTecnica": "Ordem Técnica",
    "ParecerTecnico": "Parecer Técnico",
    "RelatorioTecnico": "Relatório Técnico",
}

const Dicionario = (termo) => {
    return traducoes[termo] || termo;
}

export default Dicionario;