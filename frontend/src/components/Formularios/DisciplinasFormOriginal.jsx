import React, { useEffect } from 'react';
import { useFieldArray } from 'react-hook-form';
import DirinfraListSelect from '../DirinfraSelect/DirinfraListSelect';
import opcoesDisciplinas from '../../utils/Disciplinas';

const DisciplinasForm = ({ register, errors, control, setValue, watch }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "disciplinas",
    });

    const valoresDisciplinas = watch("disciplinas", fields);

    const handleAddDisciplina = () => {
        append(""); // Adiciona um campo vazio para a nova disciplina
    };

    const handleRemoveDisciplina = (index) => {
        remove(index);
    };

    const handleSelectChange = (index, value) => {
        const novasDisciplinas = [...valoresDisciplinas];
        novasDisciplinas[index] = value; // Atualiza o valor no índice específico
        setValue("disciplinas", novasDisciplinas, { shouldValidate: true }); // Atualiza o estado global
    };

    return (
        <div className="linha">
            <em className="obrigatorios">*</em>
            <div style={{ border: '1px solid', borderColor: 'var(--color-borderdefault)', borderRadius: '4px', margin: '0 10px', padding: '2px', width: '100%' }}>
                {fields.map((field, index) => (
                    <React.Fragment key={field.id}>
                        {index > 0 && (
                            <hr
                                style={{
                                    border: "none",
                                    height: "1px",
                                    background: "linear-gradient(to right, transparent, var(--color-borderdefault), transparent)",
                                    // maskImage: "repeating-linear-gradient(to right, #000 0 1px, transparent 1px 6px)",
                                    // WebkitMaskImage: "repeating-linear-gradient(to right, #000 0 1px, transparent 1px 6px)",
                                    margin: "10px 20px 30px"
                                }}
                            />
                        )}
                        <div key={field.id} className='coluna' style={{ marginTop: '20px', rowGap: '5px' }}>
                            <DirinfraListSelect
                                name={`disciplinas.${index}`}
                                label={`Disciplina ${index + 1}`}
                                registro={register}
                                defaultValue={valoresDisciplinas[index] || ""}
                                /* placeholder='Selecione uma disciplina' */
                                required={true}
                                erros={errors}
                                setValue={setValue}
                                watch={watch}
                                options={opcoesDisciplinas}
                                onChange={(e) => handleSelectChange(index, e.target.value)}
                            />
                            <button
                                className='deletar'
                                type="button"
                                style={{ marginBottom: '20px', maxWidth: '120px', margin: '5px 2.0% 5px auto' }}
                                onClick={() => handleRemoveDisciplina(index)}
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
                    onClick={handleAddDisciplina}
                >
                    Adicionar Disciplina
                </button>
            </div>
        </div>
    );
};

export default DisciplinasForm;
