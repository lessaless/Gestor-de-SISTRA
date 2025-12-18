import React, { useEffect } from 'react';
import DirinfraInput from '../DirinfraInput/DirinfraInput';
import Dicionario from '../../utils/Dicionario';

const PeriodoDeElaboracaoForm = ({ 
    register, 
    errors, 
    watch, 
    setValue,
    dataInicioField = 'data_inicio_confecc_doc',
    dataEntregaField = 'data_entrega_doc',
    periodoField = 'periodo_elaboracao',
    label
}) => {
    const dataInicio = watch(dataInicioField);
    const dataEntrega = watch(dataEntregaField);

    // Calculate and set the difference whenever dates change
    useEffect(() => {
        if (dataInicio && dataEntrega) {
            const inicio = new Date(dataInicio);
            const entrega = new Date(dataEntrega);

            if (!isNaN(inicio.getTime()) && !isNaN(entrega.getTime())) {
                const diffTime = entrega.getTime() - inicio.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                setValue(periodoField, diffDays);
            } else {
                setValue(periodoField, '');
            }
        } else {
            setValue(periodoField, '');
        }
    }, [dataInicio, dataEntrega, setValue, dataInicioField, dataEntregaField, periodoField]);

    return (
        <div className='linha'>
            <DirinfraInput
                label={label || Dicionario('periodo_elaboracao') || 'Período de Elaboração (dias)'}
                name={periodoField}
                type="text"
                registro={register}
                erros={errors}
                disabled={true}
                placeholder='Calculado automaticamente'
            />
        </div>
    );
};

export default PeriodoDeElaboracaoForm;