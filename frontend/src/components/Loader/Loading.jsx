import './loading_style.css';

function Loading({personalizarEstilo, mensagem}) {
    return (
        <div className="loader" style={personalizarEstilo}>
            <div className="logo-bg"/>   {/* só fundo com máscara */}
            <div className="atom">
                <div className="electron"></div>
                <div className="electron"></div>
                <div className="electron"></div>
            </div>
            <p className="mensagem">{mensagem || ''}</p>
        </div>
    )
}

export default Loading;