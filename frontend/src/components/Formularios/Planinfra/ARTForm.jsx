import React, { useEffect, useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from "react-router-dom";

import DirinfraInput from '../../DirinfraInput/DirinfraInput';
import GerenciadorDeArquivo from '../../GerenciadorDeArquivo/GerenciadorDeArquivo';
import DirinfraSelect from '../../DirinfraSelect/DirinfraSelect';
import DirinfraTextarea from '../../DirinfraTextarea/DirinfraTextarea';
import DirinfraListSelect from '../../DirinfraSelect/DirinfraListSelect';

import demandaService from '../../../services/demandaService';
import utilService from '../../../services/utilService';
import { useSalvar } from '../../../utils/SalvarContext';


import {
  listarDados,
  onError,
  onSubmit,
  receberArquivo,
  redirecionar
} from '../../../utils/gerCrud';

const GeralForm = () => {
  const contexto = useFormContext();                 // pode ser undefined
  const localForm = useForm();                       // sempre chamado
  const metodo = contexto || localForm;
  const { onSaved, onDesvincular } = useSalvar() || {}; // pega função do pai


  const { register, handleSubmit, formState: { errors, isDirty }, reset, setValue, watch } = metodo;
  const data = watch();
  const { id, id_demanda } = useParams();
  const navigate = useNavigate();
  const pagina = id || data?._id ? 'Editar' : 'Criar';
  const colecao = 'teps';

  const [arquivo, setArquivo] = useState(null);
  const [arquivoAlterado, setArquivoAlterado] = useState(false);
  const [demandas, setDemandas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [codigosBim, setCodigosBim] = useState([]);
  const [codigoBimEscolhido, setCodigoBimEscolhido] = useState([]);
  const [temErroArquivo, setTemErroArquivo] = useState(false);

  // === NOVO: Estado para as abas (folders) ===
  const [aba, setAba] = useState('dados'); // 'dados' | 'arquivos'

  const atualizarIsDirty = (estado) => {   // ATUALIZA EXIBIÇÃO DO BOTÃO SALVAR
    setArquivoAlterado(estado);
  };

  const arquivoId = watch("arquivo_id");  // observa o campo do form
  useEffect(() => {
    if (onDesvincular) {
      onDesvincular(() => {
        setValue("id_demanda", "_desvincular");
      });
    }
  }, [onDesvincular]);
  useEffect(() => {
    if (!arquivoId) return;
    async function buscarArquivo() {
      try {
        const arquivoObj = await receberArquivo(arquivoId);
        setArquivo(arquivoObj);
      } catch (error) {
        console.error("Erro ao carregar arquivo:", error);
      }
    }
    buscarArquivo();
  }, [arquivoId]);

  useEffect(() => { // CASO RECEBA ID NA URL, BUSCA DADOS DO ID
    async function buscarDado() {
      setIsLoading(true);
      try {
        const data = { colecao, filtro: { _id: id } };
        const resp = await listarDados(data);

        // formatar datas para o formulário
        window.dataParaFormulario(resp[0]);

        if (resp[0].codigo_bim) setCodigoBimEscolhido(resp[0].codigo_bim);
        reset(resp[0]);

        if (resp[0].arquivo_id) {
          const arquivoObj = await receberArquivo(resp[0].arquivo_id);
          setArquivo(arquivoObj);
        }
        setIsLoading(false);
      } catch (error) {
        toast.error(error.message);
      }
    }
    if (!id || contexto) return; // evita conflito com formulário em contexto
    buscarDado();
  }, [id]);

  const aoEnviar = async (data) => {
    const listaChaves = Object.keys(data);
    data.colecao = colecao;
    data.arquivo = arquivo;

    if (data.id_demanda === "_desvincular") {
      data.id_demanda = null;
    } else if (!data.id_demanda && id_demanda) {
      data.id_demanda = id_demanda;
    }

    try {
      // Verificação se há arquivo quando obrigatório
      if (!arquivo) {
        setTemErroArquivo(true);
        throw new Error("É necessário realizar upload do ART");
      }
      const resp = await onSubmit(data, pagina, listaChaves);
      toast.success(resp.message);
      onSaved?.(data.id_demanda === "_desvincular" ? null : resp.obj);

      // se foi aberto como popup
      if (window.opener) {
        window.opener.atualizarPagina?.();
        setTimeout(() => window.close(), 1500);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const aoErrar = (errors) => {
    try {
      onError(errors);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // lista de demandas
  useEffect(() => {
    const fetchDemandas = async () => {
      try {
        const listaDemandas = await demandaService.lerDemandas();
        setDemandas(listaDemandas.data);
      } catch (error) {
        toast.error("Erro ao carregar a lista de demandas");
      }
    };
    fetchDemandas();
  }, []);

  // códigos BIM
  useEffect(() => {
    const fetchCodigosBim = async () => {
      try {
        const listaCodigosBim = await utilService.obterCodigosBim();
        const codigosBimObtidos = listaCodigosBim.data.map(item => ({
          label: `${item.codigo_bim}`,
          value: `${item.codigo_bim}`
        }));
        setCodigosBim(codigosBimObtidos);
      } catch (error) {
        toast.error("Erro ao carregar Códigos Bim");
      }
    };
    fetchCodigosBim();
  }, []);

  const aoSelecionarCodigoBim = (eventOrValue) => {
    const sel = eventOrValue?.target ? eventOrValue.target.value : eventOrValue;
    const codigoBim = codigosBim.find(o => o.value === sel) || codigosBim.find(o => o.label === sel);
    setCodigoBimEscolhido(codigoBim);
    setValue('codigo_bim', codigoBim?.value || '');
  };

  // Acessibilidade de tabs: setas esquerda/direita
  const onTabKeyDown = (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const order = ['dados', 'arquivos'];
    const idx = order.indexOf(aba);
    let next = idx;
    if (e.key === 'ArrowRight') next = (idx + 1) % order.length;
    if (e.key === 'ArrowLeft') next = (idx - 1 + order.length) % order.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = order.length - 1;
    setAba(order[next]);
    // foca o botão da nova aba
    const el = document.getElementById(`tab-${order[next]}`);
    el?.focus();
  };

  return (
    <>
      <div className='formulario-titulo'>
        <h3> Formulário: Anotação de Responsabilidade Técnica </h3>
      </div>

      {/* === BARRA DE ABAS (FOLDERS) NO TOPO === */}
      <div
        className="abas"
        role="tablist"
        aria-label="Seções do formulário"
        onKeyDown={onTabKeyDown}
        style={{ marginBottom: 8 }}
      >
        <button
          type="button"
          id="tab-dados"
          role="tab"
          aria-selected={aba === 'dados'}
          aria-controls="panel-dados"
          className={aba === 'dados' ? 'ativo' : ''}
          onClick={() => setAba('dados')}
        >
          Dados
        </button>

        <button
          type="button"
          id="tab-arquivos"
          role="tab"
          aria-selected={aba === 'arquivos'}
          aria-controls="panel-arquivos"
          className={aba === 'arquivos' ? 'ativo' : ''}
          onClick={() => setAba('arquivos')}
        >
          Arquivos
        </button>
      </div>

      <div className='formulario-main'>
        {/* === PAINEL: DADOS === */}
        <section
          id="panel-dados"
          role="tabpanel"
          aria-labelledby="tab-dados"
          hidden={aba !== 'dados'}
          className={aba !== 'dados' ? 'oculto' : ''}
        >
          <div className='formulario-content'>
            <div className='linha'>
              <DirinfraListSelect
                label='Código BIM'
                name='codigo_bim'
                registro={register}
                placeholder='ID BIM deste ART...'
                erros={errors}
                options={codigosBim}
                onChange={aoSelecionarCodigoBim}
                required={true}
                setValue={setValue}
                watch={watch}
              />
            </div>
            <div className='linha'>
              <DirinfraListSelect
                label='Código BIM'
                name='codigo_bim'
                registro={register}
                placeholder='ID BIM deste ART...'
                erros={errors}
                options={codigosBim}
                onChange={aoSelecionarCodigoBim}
                required={true}
                setValue={setValue}
                watch={watch}
              />
            </div>
            <div className='linha'>
              <DirinfraListSelect
                label='Código BIM'
                name='codigo_bim'
                registro={register}
                placeholder='ID BIM deste ART...'
                erros={errors}
                options={codigosBim}
                onChange={aoSelecionarCodigoBim}
                required={true}
                setValue={setValue}
                watch={watch}
              />
            </div>

            <div className='linha'>
              <button
                className='btn'
                type="submit"
                disabled={!isDirty && !arquivoAlterado}
                onClick={() => handleSubmit(aoEnviar, aoErrar)()}
              >
                Salvar
              </button>
            </div>
          </div>
        </section>

        {/* === PAINEL: ARQUIVOS === */}
        <section
          id="panel-arquivos"
          role="tabpanel"
          aria-labelledby="tab-arquivos"
          hidden={aba !== 'arquivos'}
          className={aba !== 'arquivos' ? 'oculto' : ''}
        >
          <div className='formulario-content'>
            <GerenciadorDeArquivo
              arquivo={arquivo}
              setArquivo={setArquivo}
              atualizarIsDirty={atualizarIsDirty}
              temErroArquivo={temErroArquivo}
              setTemErroArquivo={setTemErroArquivo}
            />
          </div>
        </section>
      </div>
    </>
  );
};

export default GeralForm;
