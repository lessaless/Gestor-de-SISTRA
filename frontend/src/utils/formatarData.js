const formatarDataLegivel = (data) => {
    if (!data) return '';
    const novaData = new Date(data).toISOString();// "2025-07-07T00:00:00.000Z"
    const [ano, mes, dia] = novaData.split('T')[0].split('-'); // ["2025", "07", "07"]
    return `${dia}/${mes}/${ano}`; // "07/07/2025"
}

export default formatarDataLegivel;