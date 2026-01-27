import React from 'react';
import DirinfraInput from '../../DirinfraInput/DirinfraInput';
import DirinfraTextArea from '../../DirinfraTextArea/DirinfraTextArea';
import DirinfraSelect from '../../DirinfraSelect/DirinfraSelect';
import { DirinfraCopyButton as CopyBtn } from '../../DirinfraCopiaButton/DirinfraCopiaButton';
import DisciplinasForm from '../DisciplinasForm';
import PalavrasChaveForm from '../PalavrasChaveForm';
import PeriodoDeElaboracaoForm from '../PeriodoDeElaboracaoForm';
import GerenciadorDeArquivo from '../../GerenciadorDeArquivo/GerenciadorDeArquivo';
import Dicionario from '../../../utils/Dicionario';

const PEIForm = ({
    // Form configuration
    Modelo,

    // React Hook Form methods
    register,
    errors,
    control,
    setValue,
    watch,
    getValues,
    handleSubmit,

    // Form state
    isDirty,
    arquivoAlterado,

    // Submit handlers
    aoEnviar,
    aoErrar,

    // File management
    arquivo,
    setArquivo,
    atualizarIsDirty,
    temErroArquivo,
    setTemErroArquivo,

    // Select options
    fasesDoProjeto = [],
    disciplinasList = [],

    // Optional: Custom fields to inject (for form-specific content)
    customFieldsBeforeDisciplinas = null,
    customFieldsAfterPalavrasChave = null,
    customFieldsBeforeSave = null,

    // Optional: Override observation field name/label
    observacaoFieldName = 'obs_pei',
    observacaoLabel = 'Observações',
    observacaoPlaceholder = null,
}) => {
    const defaultPlaceholder = `Digite aqui informações relevantes sobre este ${Modelo} que não foram destacadas nos campos anteriores.`;

    return (
        <>
            <div className='formulario-titulo'>
                <h3>Formulário: {Modelo}</h3>
            </div>

            <div className='formulario-main'>
                <div className='formulario-content'>
                    <div className='linha'>
                        <em className="obrigatorios">*</em>
                        <DirinfraInput
                            name='titulo_doc'
                            erros={errors}
                            label={Dicionario('titulo_doc')}
                            placeholder='Ex.: Análise de solicitação de aditivo de fundações'
                            registro={register}
                            required={true}
                        />
                    </div>

                    <div className='linha'>
                        <DirinfraInput
                            name='codigo_projeto_bim'
                            erros={errors}
                            label='Código Projeto BIM'
                            placeholder='Apenas se atrelado a demanda.'
                            registro={register}
                            required={false}
                            disabled={true}
                            addon={
                                <CopyBtn
                                    name='codigo_projeto_bim'
                                    label='Código Projeto BIM'
                                    inputProps={{ getValues }}
                                    size={34}
                                />
                            }
                        />
                    </div>

                    <DirinfraSelect
                        label='Fase Do Projeto'
                        name='fase_do_projeto'
                        registro={register}
                        required={true}
                        options={fasesDoProjeto.map(fp => ({
                            value: String(fp.codigo),
                            label: fp.titulo,
                        }))}
                        erros={errors}
                        placeholder='Selecione a Fase do Documento'
                        watch={watch}
                        setValue={setValue}
                        value={String(watch('fase_do_projeto') ?? '')}
                    />

                    <DirinfraSelect
                        label='Disciplina Principal (para código BIM)'
                        name='disciplina_principal'
                        registro={register}
                        required={true}
                        options={disciplinasList.map(disc => ({
                            value: String(disc.codigo),
                            label: disc.titulo,
                        }))}
                        erros={errors}
                        placeholder='Selecione a Disciplina Principal'
                        watch={watch}
                        setValue={setValue}
                        value={String(watch('disciplina_principal') ?? '')}
                    />

                    {/* Allow custom fields before DisciplinasForm */}
                    {customFieldsBeforeDisciplinas}

                    <DisciplinasForm
                        register={register}
                        errors={errors}
                        control={control}
                        setValue={setValue}
                        watch={watch}
                    />

                    <PalavrasChaveForm
                        register={register}
                        errors={errors}
                        control={control}
                        setValue={setValue}
                        watch={watch}
                    />

                    {/* Allow custom fields after PalavrasChaveForm */}
                    {customFieldsAfterPalavrasChave}

                    <div className='linha'>
                        <DirinfraInput
                            name='codigo_documento_bim'
                            erros={errors}
                            label='Código Documento BIM'
                            placeholder='Apenas se atrelado a demanda.'
                            registro={register}
                            required={false}
                            disabled={true}
                            addon={
                                <CopyBtn
                                    name="codigo_documento_bim"
                                    label="Código Documento BIM"
                                    inputProps={{ getValues }}
                                    size={34}
                                />
                            }
                        />
                    </div>

                    <div className='linha'>
                        <DirinfraInput
                            name='data_inicio_confecc_doc'
                            erros={errors}
                            label={Dicionario('data_inicio_confecc_doc')}
                            placeholder='DD/MM/AAAA'
                            registro={register}
                            required={false}
                            type='date'
                        />
                    </div>

                    <div className='linha'>
                        <DirinfraInput
                            name='data_entrega_doc'
                            erros={errors}
                            label={Dicionario('data_entrega_doc')}
                            placeholder='DD/MM/AAAA'
                            registro={register}
                            required={false}
                            type='date'
                            min={watch('data_inicio_confecc_doc') || undefined} // ✅ HTML5 validation
                            validar={{  // ✅ React Hook Form validation (already supported by DirinfraInput)
                                afterOrEqualStart: (value) => {
                                    const dataInicio = watch('data_inicio_confecc_doc');
                                    if (!value || !dataInicio) return true;
                                    return value >= dataInicio ||
                                        'A data de entrega não pode ser anterior à data de início';
                                }
                            }}
                        />
                    </div>

                    <PeriodoDeElaboracaoForm
                        register={register}
                        errors={errors}
                        watch={watch}
                        setValue={setValue}
                    />

                    <div className='linha'>
                        <DirinfraTextArea
                            name={observacaoFieldName}
                            erros={errors}
                            label={observacaoLabel}
                            placeholder={observacaoPlaceholder || defaultPlaceholder}
                            registro={register}
                            required={false}
                            a={200}
                        />
                    </div>

                    {/* Allow custom fields before save button */}
                    {customFieldsBeforeSave}

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

                <div className='formulario-content'>
                    <GerenciadorDeArquivo
                        arquivo={arquivo}
                        setArquivo={setArquivo}
                        atualizarIsDirty={atualizarIsDirty}
                        temErroArquivo={temErroArquivo}
                        setTemErroArquivo={setTemErroArquivo}
                    />
                </div>
            </div>
        </>
    );
};

export default PEIForm;