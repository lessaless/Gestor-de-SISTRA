import crudService from "../services/crudService";
import arquivoService from "../services/arquivoService";
import DirinfraConfirmar from "../components/DirinfraConfirmar/DirinfraConfirmar";
import Concordar from '../components/DirinfraConcordar/DirinfraConcordar';

//-------------------------------------------------------------------------------------------------
const atualizarChaves = async (colecao) => {

    if (!colecao || colecao === 'null') {
        /* setListaChaves([]);
        setDados([]); */
        return { temArquivo: false, listaChaves: [] };
    }
    /* if (pagina === 'Editar') setPagina('Criar'); */
    const data = { 'colecao': colecao, 'chaves': true };

    try {
        const resp = await crudService.lerDados(data);
        if (!(resp?.status === 200 && Array.isArray(resp?.data))) {
            throw new Error('Dados não recebidos ou inválidos!');
        }

        const temChaveArquivo = resp?.data.find(objeto => objeto.nome === 'arquivo_id');
        if (temChaveArquivo) {
            //controle para exibir Gerenciador de Arquivos nos componentes
            //Não exibir o campo arquivo como input ou check input
            const listaChavesSemArquivo = resp?.data.filter(objeto => objeto.nome !== 'arquivo_id');
            return { temArquivo: true, listaChaves: listaChavesSemArquivo };
        }
        else {
            return { temArquivo: false, listaChaves: resp?.data };
        }

    } catch (error) {
        console.error(error);
        throw new Error(error.message);

    }
};

//-------------------------------------------------------------------------------------------------
const listarDados = async (filtro) => {
    if (!filtro || filtro === 'null') return;

    try {
        const resp = await crudService.lerDados(filtro);
        if (resp?.status !== 200) throw new Error('Não foi possível ler os dados da coleção!');

        const dados = resp?.data;
        return dados;

    } catch (error) {
        console.error(error.message);
        throw new Error(error.message);
    }
}

//-------------------------------------------------------------------------------------------------
const editarDado = (item, colecao) => {
    let colecao2 = colecao || item.colecao;
    if (!item || !colecao2) return;
    item.colecao = colecao2;
    let layout = colecao2 === 'demandas' ? 'main' : 'popup';
    redirecionar('Editar', item, layout);
};

//-------------------------------------------------------------------------------------------------
const redirecionar = (subpagina, item, layout = 'main', origem) => {
    // console.log('redirecionar', subpagina, item, layout, origem);

    // tipoFluxo = docs ou planinfra
    const tipoFluxo = origem || window.document.location.pathname.split("/")[2];// '/main/docs/listar' = 'docs'
    if (!tipoFluxo) console.error(`Erro interno do sistema: 'tipoFluxo' não recebido no 'redirecionar'. (${tipoFluxo})`)

    const _colecao = item?.colecao;
    const id =  _colecao === 'demandas' ? item.id_demanda :  item?._id;
    const endpoint = _colecao === 'demandas' ? `${id}` :  `${_colecao}/${id}`;
    const edicaoTipo = _colecao === 'demandas' ? `editardemanda` : `editar`;

    const urls = {
        'Criar': `/${layout}/${tipoFluxo}/cadastrar/`,
        'Editar': `/${layout}/${tipoFluxo}/${edicaoTipo}/${endpoint}`,
        'Listar': `/${layout}/${tipoFluxo}/listar/`
    };

    if (!urls[subpagina]) throw new Error(`Página inválida! (${subpagina})`);

    // console.log('Redirecionando para:', urls[subpagina]);
    // return;

    // Abre a URL em um pop-up
    if (layout === 'popup') {
        
        const ePopup1 = window.innerWidth === 600 ? true : false;
        const larguraPopup1 = 600;
        const larguraPopup2 = 900;//popup 2 é para editar demandas, tem menu, deve ser mais largo
        const popupWidth = ePopup1 ? larguraPopup2 : larguraPopup1;
        
        //Diminui 100px do popup1, e mantém a altura no popup2
        const popupHeight = ePopup1 ? window.innerHeight : window.innerHeight - 100;
        
        const left = ePopup1 ? larguraPopup1 : 0;//posiciona popup2 à direita do popup1
        const top = 0;
        
        const popupOptions = `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,resizable=yes,location=no,toolbar=no,menubar=no,status=no`;
        return window.open(urls[subpagina], '_blank', popupOptions);

    } else {
        // Redireciona na mesma aba
        return window.location.href = urls[subpagina];
    }
}

//-------------------------------------------------------------------------------------------------
const deletarDado = async (item, colecao, Confirmacao) => {

    //Confirmacao é quando vem da Confirmação do ID pelo usuário, não precisa digitar pra confirmar o objeto

    const verificacao = item._id.slice(-6);
    const titulos = {
        'acls': item._id,
        'arquivos': item.titulo_arquivo,
        'demandas': item.titulo_demanda,
        'grupos': item.titulo_grupo,
        'links': item.codigo_link,
        'users': item.nome,
    }
    const sub = 'o documento';
    const tituloObjeto = `${titulos[colecao] ? "'" + titulos[colecao] + "'" : sub}`;

    let resp;
    if (!Confirmacao) {
        resp = await DirinfraConfirmar(`Digite '${verificacao}' para deletar ${tituloObjeto} permanentemente.`)
    } else resp = verificacao;

    if (resp === null) return false;//cancelar
    if (resp !== verificacao) throw new Error('Confirmação inválida!');

    const data = {
        "colecao": colecao,
        "filtro": {
            "_id": item._id
        }
    }

    try {
        const resp = await crudService.deletarDados(data);

        if (resp?.status === 204) return ({ 'message': `${tituloObjeto} foi deletado(a) com sucesso!` });

    } catch (error) {
        console.error(error);
        throw new Error(error.message);

    }
};

//-------------------------------------------------------------------------------------------------
const enviarArquivo = async (arquivo) => {
    if (!arquivo) return false;

    try {
        const resp = await arquivoService.carregarArquivo({ file: arquivo });
        //console.log("status da função enviarArquivo", resp?.status)
        //retorna id para armazenar no objeto
        if (resp?.status === 201) return resp?.data.arquivo_id;
        else return false;

    } catch (error) {
        throw new Error(`Erro ao enviar arquivo para o servidor: ${error}`);
    }
};

//-------------------------------------------------------------------------------------------------
const receberArquivo = async (id) => {
    if (!id) return false;

    try {
        const resp = await arquivoService.buscarArquivo(id);
        //retorna id para armazenar no objeto
        if (resp?.status === 200) return resp?.data;
        else return false;

    } catch (error) {
        throw new Error(`Erro ao buscar arquivo no servidor: ${error}`);
    }
};

//-------------------------------------------------------------------------------------------------
const onSubmit = async (data, pagina, listaChaves, confirmarID) => {

    const objReset = Object.fromEntries(Object.keys(data).map(key => [key, '']));//limpa todas as chaves para o reset()
    const dadosPreenchidos = { ...data };//dados que vão para o BD
    console.log("Valor de dadosPreenchidos é ", dadosPreenchidos)
    dadosPreenchidos.colecao = data.colecao;

    if (pagina === 'Editar') {

        listaChaves.forEach(chave => {

            const nome = chave.nome;//vem da lista do BD
            const tipo = chave.tipo;//vem da lista do BD
            const valor = dadosPreenchidos[nome];//vem do formulário

            // Garantir formato de Arrays ao Editar
            if (tipo === 'string') {
                dadosPreenchidos[nome] = valor.split(',').map(item => item.trim());
            } else if (Array.isArray(valor)) {
                dadosPreenchidos[nome] = valor.map(item => item.trim());
            }

            //verificar SE é chave automática E SE vazio ou undefined, não manda (deleta a chave); se não for, é exclusão e deve enviar
            if ((chave.automatico && (valor === "" || valor === undefined))) {
                delete dadosPreenchidos[nome];
            }
        });
    }


    if (data.arquivo) {//se tem arquivo, tenta salvar primeiro para pegar o id e atribuir na coleção desejada
        if (data.arquivo._id) {//se tiver _id, veio do BD, e não alterou
            dadosPreenchidos.arquivo_id = data.arquivo_id;

        } else {//novo ou substituição
            const arquivo_id = await enviarArquivo(data.arquivo);
            if (arquivo_id) dadosPreenchidos.arquivo_id = arquivo_id;
            
            else throw new Error('Erro ao enviar arquivo para o servidor!');
        }

    } else {

        if (dadosPreenchidos.arquivo_id) {//se não tem arquivo, mas tem arquivo_id, é exclusão
            dadosPreenchidos.arquivo_id = null;
        }

    }

    delete dadosPreenchidos.arquivo;//não reenviar arquivo

    try {

        let resp;
        if (pagina === 'Editar') {
            resp = await crudService.atualizarDados(dadosPreenchidos);

            if (resp?.status === 201) {
                return ({ message: 'Dados atualizados com sucesso!', obj: resp?.data });
            }

        } else {
            console.log("Valor de dadosPreenchidos é", dadosPreenchidos)
            resp = await crudService.criarDados(dadosPreenchidos);

            if (resp?.status === 201) {
                // console.log(`O valor de confirmarID é ${confirmarID}`)
                // console.log(`O valor de resp é ${resp?.estado_demanda}`)
                if (confirmarID) {
                    const resposta = await Concordar('', `Deseja numerar o documento como ${confirmarID} nº ${resp.data.id_sistra}?`, 'Cancelar', 'Confirmar');

                    if (resposta) return ({ message: 'Dados criados com sucesso!', obj: resp?.data, reset: objReset });
                    else return await deletarDado(resp.data, data.colecao, true);//true = deletar via Confirmação

                } else return ({ message: 'Dados criados com sucesso!', obj: resp?.data, reset: objReset });

                //return ({ message: 'Dados criados com sucesso!', obj: objReset });
                //return resp.data
                /* setArquivo(''); */
            }
        }

    } catch (erro) {
        console.error(erro);
        throw new Error(erro.message);
    }
}; 



//-------------------------------------------------------------------------------------------------
const onError = (erros) => {
    // Função recursiva para verificar erros aninhados
    const verificarErrosAninhados = (objetoErro, chavePai = '') => {
        for (const chave in objetoErro) {
            if (objetoErro.hasOwnProperty(chave)) {
                const erro = objetoErro[chave];
                const caminhoAtual = chavePai ? `${chavePai}.${chave}` : chave;

                if (erro?.type) {
                    switch (erro.type) {
                        case 'required':
                            throw new Error(erro.message || 'Os campos em vermelho são obrigatórios.');
                        case 'pattern':
                            throw new Error(erro.message || 'Padrão de caracteres inválidos.');
                        case 'minLength':
                            throw new Error(erro.message || `Mínimo de caracteres não atingido! (Mínimo: ${erro.value} caracteres)`);
                        case 'maxLength':
                            throw new Error(erro.message || `Máximo de caracteres ultrapassado! (Máximo: ${erro.value} caracteres)`);
                        case 'validate':
                            throw new Error(erro.message || 'Erro de validação nos campos em vermelho!');
                        default:
                            throw new Error(erro.message || 'Erro desconhecido no formulário.');
                    }
                }

                // Verifica erros em níveis mais profundos
                if (typeof erro === 'object' && erro !== null) {
                    verificarErrosAninhados(erro, caminhoAtual);
                }
            }
        }
    };
    // Verifica todos os erros, incluindo os aninhados
    verificarErrosAninhados(erros);
};


//-------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------
export {
    atualizarChaves,
    deletarDado,
    editarDado,
    listarDados,
    onError,
    onSubmit,
    receberArquivo,
    redirecionar
};