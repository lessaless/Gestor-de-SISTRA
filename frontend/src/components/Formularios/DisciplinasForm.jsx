import React, { useState, useEffect } from 'react';
import { useFieldArray } from 'react-hook-form';
import DirinfraInput from '../DirinfraInput/DirinfraInput';
import utilService from '../../services/utilService';
import DirinfraListSelect from '../../components/DirinfraSelect/DirinfraListSelect';
import Dicionario from '../../utils/Dicionario';
import opcoesDisciplinas from '../../utils/Disciplinas';

const buscarEfetivo = async () => {
    try {
        const efetivo = await utilService.obterEfetivo();
        const mapaEfetivo = efetivo.data.reduce((acc, item) => {
            let posto = item.POSTO?.toUpperCase();
            let nome = item.NOME
                ?.toLowerCase()
                .split(' ')
                .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
                .join(' ');
            acc[item.SARAM] = `${posto} ${nome}`;
            return acc;
        }, {});
        return mapaEfetivo;
    } catch (error) {
        console.error('Erro ao obter a lista do Efetivo:', error);
    }
};

const DisciplinaAutorForm = ({ register, errors, control, setValue, watch }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "disciplinasAutores", // Nome único para o array combinado
    });

    const [responsaveis, setResponsaveis] = useState([]);
    const valoresCampos = watch("disciplinasAutores", fields);

    // Atualiza os nomes dos autores baseado no SARAM
    useEffect(() => {
        const atualizarNomesAutores = async () => {
            try {
                const mapaEfetivo = await buscarEfetivo();
                valoresCampos.forEach((item, index) => {
                    if (item.SARAM && mapaEfetivo[item.SARAM]) {
                        setValue(`disciplinasAutores.${index}.nome_militar`, mapaEfetivo[item.SARAM]);
                    }
                });
            } catch (error) {
                console.error('Erro ao atualizar nomes dos autores:', error);
            }
        };
        atualizarNomesAutores();
    }, [valoresCampos, setValue]);

    // Busca a lista de responsáveis
    useEffect(() => {
        const fetchResponsaveis = async () => {
            try {
                const efetivo = await utilService.obterEfetivo();
                const options = efetivo.data.map(item => ({
                    label: `${item.POSTO} ${item.NOME} - ${item.OM}`,
                    value: `${item.POSTO} ${item.NOME} - ${item.OM}`,
                    SARAM: item.SARAM
                }));
                setResponsaveis(options);
            } catch (error) {
                console.error('Erro ao obter a lista do Efetivo:', error);
            }
        };
        fetchResponsaveis();
    }, []);

    const handleAddItem = () => {
        append({
            disciplina: '',
            SARAM: '',
            tempo_gasto: '',
            nome_militar: ''
        });
    };

    const handleRemoveItem = (index) => {
        remove(index);
    };

    const handleSelectResponsavel = (index, value) => {
        const selectedOption = responsaveis.find(responsavel => responsavel.label === value);
        if (selectedOption) {
            setValue(`disciplinasAutores.${index}.SARAM`, selectedOption.SARAM);
            setValue(`disciplinasAutores.${index}.nome_militar`, selectedOption.label);
        } else {
            setValue(`disciplinasAutores.${index}.SARAM`, '');
            setValue(`disciplinasAutores.${index}.nome_militar`, value);
        }
    };

    const handleSelectDisciplina = (index, value) => {
        setValue(`disciplinasAutores.${index}.disciplina`, value, { shouldValidate: true });
    };

    return (
        <div className='linha'>
            <em className="obrigatorios">*</em>
            <div style={{
                border: '1px solid',
                borderColor: 'var(--color-borderdefault)',
                borderRadius: '4px',
                margin: '0 10px',
                padding: '2px',
                width: '100%'
            }}>
                {fields.map((field, index) => (
                    <React.Fragment key={field.id}>
                        {index > 0 && (
                            <hr
                                style={{
                                    border: "none",
                                    height: "1px",
                                    background: "linear-gradient(to right, transparent, var(--color-borderdefault), transparent)",
                                    margin: "10px 20px 30px"
                                }}
                            />
                        )}
                        <div className='coluna' style={{ marginTop: '20px', rowGap: '5px' }}>
                            {/* Campo Disciplina */}
                            <DirinfraListSelect
                                name={`disciplinasAutores.${index}.disciplina`}
                                label={`Disciplina ${index + 1}`}
                                registro={register}
                                defaultValue={field.disciplina}
                                placeholder='Selecione uma disciplina'
                                required={true}
                                erros={errors}
                                setValue={setValue}
                                watch={watch}
                                options={opcoesDisciplinas}
                                onChange={(e) => handleSelectDisciplina(index, e.target.value)}
                            />

                            {/* Campo Responsável */}
                            <DirinfraListSelect
                                name={`disciplinasAutores.${index}.nome_militar`}
                                label={`Responsável`}
                                registro={register}
                                defaultValue={field.nome_militar}
                                placeholder='Selecione um responsável'
                                required={true}
                                erros={errors}
                                setValue={setValue}
                                onChange={(e) => handleSelectResponsavel(index, e.target.value)}
                                watch={watch}
                                options={responsaveis}
                            />

                            {/* Campo SARAM */}
                            {/* <DirinfraInput
                                label='SARAM'
                                name={`disciplinasAutores.${index}.SARAM`}
                                type="number"
                                registro={register}
                                erros={errors}
                                required={true}
                            /> */}
                            <DirinfraInput
                                label='SARAM'
                                name={`disciplinasAutores.${index}.SARAM`}
                                type="number"
                                registro={register}
                                erros={errors}
                                required={true}
                                disabled={true}
                                style={{ backgroundColor: 'var(--color-backgrounddisabled)', 
                                    cursor: 'not-allowed', width: '100%'
                                 }}
                            />

                            {/* Campo Horas empregadas */}
                            <DirinfraInput
                                label={Dicionario('tempo_gasto')}
                                type="number"
                                name={`disciplinasAutores.${index}.tempo_gasto`}
                                registro={register}
                                defaultValue={field.tempo_gasto}
                                placeholder='Estimativa do tempo empregado'
                                erros={errors}
                            />

                            <button
                                className='deletar'
                                type="button"
                                style={{ maxWidth: '120px', margin: '5px 2.0% 20px auto' }}
                                onClick={() => handleRemoveItem(index)}
                            >
                                Remover
                            </button>
                        </div>
                    </React.Fragment>
                ))}
                <button
                    className='novo'
                    type="button"
                    style={{ minWidth: '180px', margin: '10px 0px 10px 2.5%' }}
                    onClick={handleAddItem}
                >
                    Adicionar Disciplina
                </button>
            </div>
        </div>
    );
};

export default DisciplinaAutorForm;