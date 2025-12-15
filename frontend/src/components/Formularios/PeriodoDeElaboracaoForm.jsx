import React, { useEffect } from 'react';
import DirinfraInput from '../DirinfraInput/DirinfraInput';
import Dicionario from '../../utils/Dicionario';

const PeriodoDeElaboracaoForm = ({ register, errors, watch, setValue }) => {
    const dataInicio = watch('data_inicio_confecc_doc');
    const dataEntrega = watch('data_entrega_doc');

    // Calculate and set the difference whenever dates change
    useEffect(() => {
        if (dataInicio && dataEntrega) {
            const inicio = new Date(dataInicio);
            const entrega = new Date(dataEntrega);

            if (!isNaN(inicio.getTime()) && !isNaN(entrega.getTime())) {
                const diffTime = entrega.getTime() - inicio.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                setValue('periodo_elaboracao', diffDays);
            } else {
                setValue('periodo_elaboracao', '');
            }
        } else {
            setValue('periodo_elaboracao', '');
        }
    }, [dataInicio, dataEntrega, setValue]);

    return (
        <div className='linha'>
            <DirinfraInput
                label={Dicionario('periodo_elaboracao') || 'Período de Elaboração (dias)'}
                name='periodo_elaboracao'
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