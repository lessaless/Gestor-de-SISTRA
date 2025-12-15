import React from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { useSalvar } from '../../../utils/SalvarContext';


import { usePEIForm } from '../MainPEI/mainPEI'; // importar o js que auxilia
//  no carregamento de valores para o uso do Form

import PEIForm from './PEIForm'; // importa o trecho com return

const Modelo = "Nota de Serviço";

const NSForm = () => {
    const contexto = useFormContext();
    const localForm = useForm();
    const metodo = contexto || localForm;
    const { onSaved } = useSalvar() || {};

    
    const {
        arquivo,
        setArquivo,
        arquivoAlterado,
        atualizarIsDirty,
        fasesDoProjeto,
        disciplinasList,
        temErroArquivo,
        setTemErroArquivo,
        isDirty,
        aoEnviar,
        aoErrar,
        handleSubmit,
    } = usePEIForm({
        colecao: 'ns',
        Modelo,
        methods: metodo,
        onSaved,
        contexto,
        requiresFile: true 
    });
    // ===== V1: 27/11/2025 ===== //
    // const { register, errors, control, setValue, watch, getValues } = metodo;
    // ===== FIM V1 ===== //
    const { register, control, setValue, watch, getValues, formState: { errors } } = metodo;


    return (
        <PEIForm
            Modelo={Modelo}
            register={register}
            errors={errors}
            control={control}
            setValue={setValue}
            watch={watch}
            getValues={getValues}
            handleSubmit={handleSubmit}
            isDirty={isDirty}
            arquivoAlterado={arquivoAlterado}
            aoEnviar={aoEnviar}
            aoErrar={aoErrar}
            arquivo={arquivo}
            setArquivo={setArquivo}
            atualizarIsDirty={atualizarIsDirty}
            temErroArquivo={temErroArquivo}
            setTemErroArquivo={setTemErroArquivo}
            fasesDoProjeto={fasesDoProjeto}
            disciplinasList={disciplinasList}
        />
    );
};

export default NSForm;
