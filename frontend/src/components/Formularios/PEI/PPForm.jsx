// =========== PP FORM =========== //
import React from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { useSalvar } from '../../../utils/SalvarContext';

import { usePEIForm } from '../MainPEI/mainPEI';
import PEIForm from './PEIForm';

const Modelo = "Pesquisa de Preço";

const PPForm = () => {
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
        colecao: 'pp',
        Modelo,
        methods: metodo,
        onSaved,
        contexto,
        requiresFile: true,
    });

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

export default PPForm;
// =========== End PP FORM =========== //
