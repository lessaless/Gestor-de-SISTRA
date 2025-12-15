// utils/validarCamposCalculados.js

/**
 * Valida e calcula campos automáticos antes de salvar documentos
 * Centraliza todas as validações de campos calculados
 * 
 * @param {Object} obj - Dados do documento a ser salvo
 * @returns {Object} Dados com campos validados/calculados
 */
const validarCamposCalculados = (obj) => {
    // ========================================
    // PERÍODO DE ELABORAÇÃO (dias)
    // ========================================
    if (obj.data_inicio_confecc_doc && obj.data_entrega_doc) {
        const inicio = new Date(obj.data_inicio_confecc_doc);
        const entrega = new Date(obj.data_entrega_doc);

        if (!isNaN(inicio.getTime()) && !isNaN(entrega.getTime())) {
            const diffTime = entrega.getTime() - inicio.getTime();
            const diffDaysCalculado = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Log se valor do frontend diverge
            if (obj.periodo_elaboracao !== undefined && obj.periodo_elaboracao !== null) {
                const valorFrontend = parseInt(obj.periodo_elaboracao);
                if (valorFrontend !== diffDaysCalculado) {
                    console.warn(`⚠️ Período de elaboração divergente! Frontend: ${valorFrontend}, Backend: ${diffDaysCalculado}`);
                }
            }

            // Sempre usa o valor calculado pelo backend
            obj.periodo_elaboracao = diffDaysCalculado;
            console.log(`✅ Período de elaboração: ${diffDaysCalculado} dias`);
        } else {
            obj.periodo_elaboracao = null;
            console.warn("⚠️ Datas inválidas para cálculo do período de elaboração");
        }
    } else {
        obj.periodo_elaboracao = null;
    }

    // ========================================
    // ADICIONE OUTRAS VALIDAÇÕES AQUI
    // ========================================

    return obj;
};

module.exports = validarCamposCalculados;