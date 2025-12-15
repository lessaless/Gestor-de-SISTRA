const Fluxo = require("../../modelos/fluxoModel");

/**
 * Adiciona doc ao fluxo (se id_demanda existir).
 */
const incluirNoFluxo = async ({ id_demanda, refId, colecao }) => {
    if (!id_demanda) return;

    let fluxo = await Fluxo.findOne({ id_demanda });
    if (!fluxo) {
        throw new Error("Falha ao vincular demanda: fluxo não encontrado.");
    }

    fluxo.pecas_fluxo.push({ colecao, refId });
    await fluxo.save();
}

/**
 * Atualiza vínculo do fluxo ao alterar doc.
 * Remove se id_demanda antigo existir e mudou.
 * Inclui se id_demanda novo existir.
 */
const atualizarFluxo = async ({ docAntes, docDepois, colecao }) => {
    const idAntigo = docAntes?.id_demanda;
    const idNovo = docDepois?.id_demanda;
    const refId = docDepois._id;

    // Remove do fluxo antigo se mudou ou foi removido
    if (idAntigo && idAntigo !== idNovo) {
        await Fluxo.updateOne(
            { id_demanda: idAntigo },
            { $pull: { pecas_fluxo: { colecao, refId } } }
        );
    }

    // Adiciona no fluxo novo (sem duplicar)
    if (idNovo) {
        await Fluxo.updateOne(
            { id_demanda: idNovo },
            { $addToSet: { pecas_fluxo: { colecao, refId } } }
            /*
                $addToSet evita duplicatas (importante não ter o _id, pois se tiver ele considera obj diferente, 
                então fica duplicado)
            */
        );
    }
}

/**
 * Remove doc do fluxo ao deletar.
 */
const removerDoFluxo = async ({ id_demanda, refId, colecao }) => {
    if (!id_demanda) return;
    // console.log("Removendo do fluxo:", { id_demanda, refId, colecao });
    await Fluxo.updateOne(
        { id_demanda },
        { $pull: { pecas_fluxo: { colecao, refId } } }
    );
    // console.log("Removido do fluxo.");
}

module.exports = {
    incluirNoFluxo,
    atualizarFluxo,
    removerDoFluxo,
};