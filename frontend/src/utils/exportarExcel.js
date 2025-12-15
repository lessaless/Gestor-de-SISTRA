import ExcelJS from 'exceljs';
import Dicionario from './Dicionario';

/**
 * Formata uma data no padrão dd/mm/aaaa
 * @param {string|Date} data 
 * @returns {string}
 */


/**
 * Gera nome do arquivo no padrão AAAA-MM-DD - export_nome
 * @param {string} nomeBase 
 */
const gerarNomeArquivo = (nomeBase) => {
    const hoje = new Date().toISOString().split('T')[0]; // AAAA-MM-DD
    return `${hoje} - ${nomeBase}`;
}

/**
 * Exporta dados para Excel com primeira linha congelada usando ExcelJS
 * @param {Array} dados Lista de objetos
 * @param {Array} camposVisiveisLista Lista de chaves a exportar
 * @param {string} nomeBase Nome base do arquivo (sem extensão)
 */
export default async function exportarExcel(dados, camposVisiveisLista, nomeBase = 'dados') {
    if (!dados?.length || !camposVisiveisLista?.length) {
        console.warn('Sem dados ou colunas visíveis para exportar.');
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Planilha');

    // Criar cabeçalhos
    const headers = camposVisiveisLista.map(campo => Dicionario(campo));
    worksheet.addRow(headers);

    // Adicionar dados
    dados.forEach(item => {
        const row = camposVisiveisLista.map(campo => {
            const valor = item[campo];

            // Detecta se é campo de data pelo nome
            if (campo.toLowerCase().includes('data') || ['expireAt', 'createdAt', 'updatedAt'].includes(campo)) {
                const data = new Date(valor);
                return data;
            }
            return valor;
        });
        worksheet.addRow(row);
    });

    //CONGELAR A PRIMEIRA LINHA
    worksheet.views = [{
        state: 'frozen',
        ySplit: 1
    }];

    // Ajustar largura das colunas com base apenas no título
    headers.forEach((header, colIndex) => {
        const comprimentoTitulo = header.length;
        worksheet.getColumn(colIndex + 1).width = Math.max(comprimentoTitulo + 2, 10); // margem de 2, mínimo de 10
    });

    // Estilizar cabeçalho
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'e3e3e3' }
    };
    headerRow.eachCell(cell => {
        cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } },
        };
    });

    // Gerar e baixar arquivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const nomeArquivoFinal = `${gerarNomeArquivo(nomeBase)}.xlsx`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = nomeArquivoFinal;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}