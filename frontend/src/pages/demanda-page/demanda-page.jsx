import React from 'react';
import { useForm } from 'react-hook-form';

import { toast } from 'react-toastify';

import DirinfraCardHeader from '../../components/DirinfraCard/DirinfraCardHeader';
import DirinfraCard from '../../components/DirinfraCard/DirinfraCard';
import DirinfraCardBody from '../../components/DirinfraCard/DirinfraCardBody';
import demandaService from '../../services/demandaService';

const DemandaPage = () => {

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm();

  const onSubmit = async (data) => {
    try {
      const resp = await demandaService.criarDemanda(data);
      
      if (resp.status === 201) toast.success("Demanda criada com sucesso!");

    } catch (erro) {
      console.error(erro);
      toast.error(erro.message);

    }
  };

  const onError = (errors) => {
    if (Object.keys(errors).some(name => errors[name].type === "required")) {
      toast.error("Os campos em vermelho são obrigatórios.");
    }
    if (Object.keys(errors).some(name => errors[name].type === "pattern")) {
      toast.error("Padrão de caracteres inválidos.");
    }
  };

  return (
    <DirinfraCard>
      <DirinfraCardHeader titulo="Demandas" />
      <DirinfraCardBody>
        <div className='coluna'>
          <div className='linha'>
            <label>Código da Demanda:</label>
            <input
              type="text"
              {...register("codigo_demanda", { required: false })}
              className={errors?.codigo_demanda && "input-erro"}
            />
          </div>

          <div className='linha'>
            <label>Nº Planinfra:</label>
            <input
              type="text"
              {...register("NR_PLANINFRA", { required: false })}
              className={errors?.NR_PLANINFRA && "input-erro"}
            />
          </div>

          <div className='linha'>
            <label>Status:</label>
            <input
              type="text"
              {...register("status", { required: false })}
              className={errors?.status && "input-erro"}
            />
          </div>

          <div className='linha'>
            <label>Título da Demanda:</label>
            <input
              type="text"
              {...register("titulo_demanda", { required: false })}
              className={errors?.titulo_demanda && "input-erro"}
            />
          </div>

          <div className='linha'>
            <label>Unidade:</label>
            <input
              type="text"
              {...register("UNIDADE", { required: false })}
              className={errors?.UNIDADE && "input-erro"}
            />
          </div>

          <button
            className='btn'
            type="submit"
            disabled={!isDirty} onClick={() => handleSubmit(onSubmit, onError)()}
          >
            Cadastrar
          </button>
        </div>
      </DirinfraCardBody>
    </DirinfraCard>
  );
};

export default DemandaPage;