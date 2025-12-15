/*
  Contexto para passar a função onSaved do pai para o formulário filho.
  Usado no GCDemandas para passar a função que atualiza o refId do formulário salvo na lista de peças.
  Assim, quando o formulário filho salva um novo documento, ele chama onSaved com o ID do novo documento,
  e o pai atualiza a lista de peças com esse ID.
*/
import { createContext, useContext } from "react";

const SalvarContext = createContext({
  onSaved: () => {},
  onDesvincular: () => {}
});

export const SalvarProvider = ({ onSaved, onDesvincular, children }) => (
  <SalvarContext.Provider value={{ onSaved, onDesvincular }}>
    {children}
  </SalvarContext.Provider>
);

export const useSalvar = () => useContext(SalvarContext);
