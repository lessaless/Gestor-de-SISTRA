import { useForm } from "react-hook-form";
import { toast } from 'react-toastify';
import { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import authReport from "../../services/authReport";
import { onError } from "../../utils/gerCrud";

import DirinfraInput from '../DirinfraInput/DirinfraInput';
import DirinfraSelect from '../DirinfraSelect/DirinfraSelect';
import DirinfraTextArea from "../DirinfraTextArea/DirinfraTextArea";
//import DirinfraListSelect from "../DirinfraSelect/DirinfraListSelect"

import ContentCopyIcon from '@mui/icons-material/ContentCopy';


const useStyles = makeStyles((theme) => ({
    inputError: {
        border: '1px solid red',
    },

    button: {
        marginTop: theme.spacing(2),
    },

    mail: {
        alignItems: 'end',
        display: 'flex',
        fontSize: '.8rem',
        justifyContent: 'start',
        marginTop: '30px',

        '& > a': {
            color: 'var(--color-font4light)',
            fontSize: 'inherit', // Usa o valor de fontSize do elemento pai
            margin: '0 5px'
        },

        '& > svg': {
            cursor: 'pointer',
            fontSize: 'inherit'
        }
    }
}));

const Contato = () => {
    const classes = useStyles();
    const { register, handleSubmit, formState: { errors, isDirty }, reset, watch/* , setValue */ } = useForm();
    const [placeholderContato, setPlaceholderContato] = useState("Selecione a Preferência de Contato");

    const EMAIL = 'portal.dirinfra@fab.mil.br';

    const copiarEmail = () => {
        navigator.clipboard.writeText(EMAIL)
        toast.info('Email copiado para a área de transferência.');
    }

    const onSubmit = async (dadosInseridos) => {
        //console.warn(dadosInseridos);
        dadosInseridos.origem = "Biblioteca Técnica";
        try {
            const resp = await authReport.adicionarReport(dadosInseridos);
            if(resp.status === 201) toast.success('Registro enviado com sucesso!');
            reset({ CATEGORIA: "", DESCRICAO: "", preferenciaContato: "", detalhesContato: "" });

        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    const handlePreferenciaChange = (event) => {
        const preferencia = event.target.value;
        let placeholder = "";
        switch (preferencia) {
            case "whatsapp":
                placeholder = "Ex: 11 99999-9999";
                break;
            case "email":
                placeholder = "Ex: seuemail@exemplo.com";
                break;
            case "telefone":
                placeholder = "Ex: (11) 4002-8922";
                break;
            case "outro":
                placeholder = "Informe seu contato";
                break;
            default:
                placeholder = "";
        }
        setPlaceholderContato(placeholder);
    };

    const aoErrar = (errors) => {
        try {
            onError(errors);
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className={`${classes.form} formulario-content`}>

            <div className='linha'>
                <em className="obrigatorios">*</em>
                <DirinfraSelect
                    name="CATEGORIA"
                    label="Categoria"
                    registro={register}
                    required={true}
                    erros={errors}
                    watch={watch}
                    options={[
                        { value: "SOLICITAR ACESSO", label: "SOLICITAR ACESSO" },
                        { value: "INTERFACE GRÁFICA", label: "INTERFACE GRÁFICA" },
                        { value: "DADOS INCORRETOS", label: "DADOS INCORRETOS" },
                        { value: "ERRO AO TENTAR SALVAR ALTERAÇÕES", label: "ERRO AO TENTAR SALVAR ALTERAÇÕES" },
                        { value: "SUGESTÃO", label: "SUGESTÃO" },
                        { value: "ELOGIO", label: "ELOGIO" },
                        { value: "OUTROS", label: "OUTROS" }
                    ]}
                />
            </div>

            <div className='linha'>
                <em className="obrigatorios">*</em>
                <DirinfraTextArea
                    name="DESCRICAO"
                    type="text"
                    erros={errors}
                    label="Descrição"
                    placeholder="Mais informações sobre o motivo do contato"
                    registro={register}
                    required={true}
                />
            </div>

            <div className='linha'>
                <em className="obrigatorios">*</em>
                <DirinfraSelect
                    name="preferenciaContato"
                    registro={register}
                    onChange={handlePreferenciaChange}
                    label="Preferência de Contato"
                    required={true}
                    erros={errors}
                    placeholder="Melhor meio de contato"
                    watch={watch}
                    options={[
                        { value: "whatsapp", label: "WhatsApp" },
                        { value: "email", label: "E-mail" },
                        { value: "telefone", label: "Telefone" },
                        { value: "outro", label: "Outro" }
                    ]}
                />
            </div>

            <div className='linha'>
                <em className="obrigatorios">*</em>
                <DirinfraInput
                    name="detalhesContato"
                    erros={errors}
                    label="Detalhes do Contato"
                    placeholder={placeholderContato}
                    registro={register}
                    required={true}
                />
            </div>

            <div className={classes.button}>
                <button disabled={!isDirty} onClick={() => handleSubmit(onSubmit, aoErrar)()}>Enviar</button>
            </div>


            <div className="linha">
                <label className={classes.mail}>
                    Ou envie um e-mail para <a href="mailto:portal.dirinfra@fab.mil.br" target="_blank">{EMAIL}</a>
                    <ContentCopyIcon
                        onClick={() => copiarEmail()}
                        title={"Clique para copiar o endereço de e-mail"}/* não funciona */
                    />
                </label>
            </div>

        </div>
    );
};

export default Contato;
